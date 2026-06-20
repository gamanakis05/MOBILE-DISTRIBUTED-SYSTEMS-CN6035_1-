-- ============================================================
-- Theatre Booking App - Database Initialization
-- ============================================================

CREATE DATABASE IF NOT EXISTS theatre_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Setup Application DB User
CREATE USER IF NOT EXISTS 'theatre_user'@'localhost' IDENTIFIED BY 'theatre_pass';
GRANT ALL PRIVILEGES ON theatre_db.* TO 'theatre_user'@'localhost';
FLUSH PRIVILEGES;

USE theatre_db;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- -------------------------------------------------------
-- Users
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)        NOT NULL,
  email       VARCHAR(150)        NOT NULL UNIQUE,
  password    VARCHAR(255)        NULL,         -- NULL when using OIDC
  external_id VARCHAR(255)        NULL,         -- Keycloak sub claim
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_external_id (external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Theatres
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS theatres (
  theatre_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  location    VARCHAR(255)  NOT NULL,
  description TEXT          NULL,
  phone       VARCHAR(30)   NULL,
  email       VARCHAR(150)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Shows
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS shows (
  show_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  theatre_id  INT UNSIGNED  NOT NULL,
  title       VARCHAR(200)  NOT NULL,
  description TEXT          NULL,
  duration    SMALLINT UNSIGNED NOT NULL COMMENT 'minutes',
  age_rating  VARCHAR(10)   NOT NULL DEFAULT 'ALL',
  poster_url  VARCHAR(500)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_show_theatre FOREIGN KEY (theatre_id)
    REFERENCES theatres(theatre_id) ON DELETE CASCADE,
  INDEX idx_theatre (theatre_id),
  INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Showtimes
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS showtimes (
  showtime_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  show_id       INT UNSIGNED  NOT NULL,
  starts_at     DATETIME      NOT NULL,
  hall          VARCHAR(50)   NOT NULL,
  total_seats   SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  CONSTRAINT fk_showtime_show FOREIGN KEY (show_id)
    REFERENCES shows(show_id) ON DELETE CASCADE,
  INDEX idx_show (show_id),
  INDEX idx_starts_at (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Seat Categories
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS seat_categories (
  category_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  showtime_id   INT UNSIGNED      NOT NULL,
  name          VARCHAR(50)       NOT NULL COMMENT 'e.g. Parterre, Balcony, VIP',
  price         DECIMAL(8,2)      NOT NULL,
  total_seats   SMALLINT UNSIGNED NOT NULL,
  reserved_seats SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_cat_showtime FOREIGN KEY (showtime_id)
    REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
  INDEX idx_showtime (showtime_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Reservations
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED  NOT NULL,
  showtime_id     INT UNSIGNED  NOT NULL,
  status          ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_res_showtime FOREIGN KEY (showtime_id)
    REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_showtime (showtime_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Reservation Items (seats per category)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservation_items (
  item_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reservation_id  INT UNSIGNED      NOT NULL,
  category_id     INT UNSIGNED      NOT NULL,
  quantity        SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price      DECIMAL(8,2)      NOT NULL,
  CONSTRAINT fk_item_reservation FOREIGN KEY (reservation_id)
    REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_category FOREIGN KEY (category_id)
    REFERENCES seat_categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Refresh Tokens
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  token       VARCHAR(512)  NOT NULL UNIQUE,
  expires_at  DATETIME      NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO theatres (name, location, description, phone, email) VALUES
('Εθνικό Θέατρο', 'Αθήνα, Αγίου Κωνσταντίνου 22', 'Το μεγαλύτερο δημόσιο θέατρο της Ελλάδας.', '210-5288100', 'info@nationaltheatre.gr'),
('Θέατρο Τέχνης', 'Αθήνα, Σταδίου 22', 'Ένα από τα σημαντικότερα θέατρα της Αθήνας.', '210-3222522', 'info@technis.gr'),
('Δημοτικό Θέατρο Πειραιά', 'Πειραιάς, Πλατεία Κοραή', 'Ιστορικό θέατρο στο κέντρο του Πειραιά.', '210-4123310', 'info@dtp.gr');

INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES
(1, 'Αντιγόνη', 'Η διάσημη τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.', 120, 'ALL'),
(1, 'Ο Βυσσινόκηπος', 'Το αριστούργημα του Τσέχοφ για την απώλεια και την αλλαγή.', 150, '12+'),
(2, 'Το Τέλος του Παιχνιδιού', 'Σκοτεινή κωμωδία του Σάμιουελ Μπέκετ.', 90, '16+'),
(3, 'Μάκβεθ', 'Η τραγωδία του Σαίξπηρ για φιλοδοξία και εξουσία.', 135, '14+');

INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES
(1, '2025-06-10 20:00:00', 'Κεντρική Σκηνή', 300),
(1, '2025-06-11 20:00:00', 'Κεντρική Σκηνή', 300),
(1, '2025-06-12 18:00:00', 'Κεντρική Σκηνή', 300),
(2, '2025-06-14 21:00:00', 'Αίθουσα Α', 200),
(2, '2025-06-15 21:00:00', 'Αίθουσα Α', 200),
(3, '2025-06-20 20:30:00', 'Πειραματική Σκηνή', 80),
(4, '2025-06-25 19:00:00', 'Μεγάλη Αίθουσα', 250);

INSERT INTO seat_categories (showtime_id, name, price, total_seats) VALUES
-- Showtime 1 (Αντιγόνη - 10 Ιουνίου)
(1, 'Πλατεία', 25.00, 150),
(1, 'Εξώστης', 20.00, 100),
(1, 'VIP', 45.00, 50),
-- Showtime 2 (Αντιγόνη - 11 Ιουνίου)
(2, 'Πλατεία', 25.00, 150),
(2, 'Εξώστης', 20.00, 100),
(2, 'VIP', 45.00, 50),
-- Showtime 3 (Αντιγόνη - 12 Ιουνίου)
(3, 'Πλατεία', 22.00, 150),
(3, 'Εξώστης', 18.00, 100),
(3, 'VIP', 40.00, 50),
-- Showtime 4 (Βυσσινόκηπος - 14 Ιουνίου)
(4, 'Πλατεία', 30.00, 120),
(4, 'Εξώστης', 25.00, 80),
-- Showtime 5 (Βυσσινόκηπος - 15 Ιουνίου)
(5, 'Πλατεία', 30.00, 120),
(5, 'Εξώστης', 25.00, 80),
-- Showtime 6 (Τέλος Παιχνιδιού)
(6, 'Γενική Είσοδος', 15.00, 80),
-- Showtime 7 (Μάκβεθ)
(7, 'Πλατεία', 28.00, 150),
(7, 'Εξώστης', 22.00, 70),
(7, 'VIP', 50.00, 30);

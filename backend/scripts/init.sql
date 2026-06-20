-- ============================================================
-- Theatre Booking App v2 — Database Init
-- ============================================================
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  user_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)         NOT NULL,
  email       VARCHAR(150)         NOT NULL UNIQUE,
  password    VARCHAR(255)         NULL,
  external_id VARCHAR(255)         NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS theatres (
  theatre_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  location    VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  phone       VARCHAR(30)  NULL,
  email       VARCHAR(150) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shows (
  show_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  theatre_id  INT UNSIGNED      NOT NULL,
  title       VARCHAR(200)      NOT NULL,
  description TEXT              NULL,
  duration    SMALLINT UNSIGNED NOT NULL,
  age_rating  VARCHAR(10)       NOT NULL DEFAULT 'ALL',
  poster_url  VARCHAR(500)      NULL,
  created_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_show_theatre FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE,
  INDEX idx_theatre (theatre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS showtimes (
  showtime_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  show_id      INT UNSIGNED      NOT NULL,
  starts_at    DATETIME          NOT NULL,
  hall         VARCHAR(50)       NOT NULL,
  total_seats  SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  CONSTRAINT fk_showtime_show FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE,
  INDEX idx_show (show_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seat_categories (
  category_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  showtime_id    INT UNSIGNED      NOT NULL,
  name           VARCHAR(50)       NOT NULL,
  price          DECIMAL(8,2)      NOT NULL,
  total_seats    SMALLINT UNSIGNED NOT NULL,
  reserved_seats SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_cat_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
  INDEX idx_showtime (showtime_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED  NOT NULL,
  showtime_id    INT UNSIGNED  NOT NULL,
  status         ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_user     FOREIGN KEY (user_id)     REFERENCES users(user_id)         ON DELETE CASCADE,
  CONSTRAINT fk_res_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservation_items (
  item_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT UNSIGNED      NOT NULL,
  category_id    INT UNSIGNED      NOT NULL,
  quantity       SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price     DECIMAL(8,2)      NOT NULL,
  CONSTRAINT fk_item_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_category    FOREIGN KEY (category_id)    REFERENCES seat_categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user  (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@theatre.gr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCjkSU8G.x8n3W1v3JBiZZi', 'admin');

-- Regular test user  (password: password)
INSERT INTO users (name, email, password, role) VALUES
('Test User', 'user@theatre.gr', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uivHi/oQW', 'user');

INSERT INTO theatres (name, location, description, phone, email) VALUES
('Εθνικό Θέατρο',           'Αθήνα, Αγίου Κωνσταντίνου 22', 'Το μεγαλύτερο δημόσιο θέατρο της Ελλάδας.',   '210-5288100', 'info@nationaltheatre.gr'),
('Θέατρο Τέχνης',           'Αθήνα, Σταδίου 22',             'Ένα από τα σημαντικότερα θέατρα της Αθήνας.', '210-3222522', 'info@technis.gr'),
('Δημοτικό Θέατρο Πειραιά', 'Πειραιάς, Πλατεία Κοραή',       'Ιστορικό θέατρο στο κέντρο του Πειραιά.',     '210-4123310', 'info@dtp.gr');

INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES
(1, 'Αντιγόνη',               'Η διάσημη τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.',    120, 'ALL'),
(1, 'Ο Βυσσινόκηπος',         'Το αριστούργημα του Τσέχοφ για την απώλεια και την αλλαγή.', 150, '12+'),
(2, 'Το Τέλος του Παιχνιδιού','Σκοτεινή κωμωδία του Σάμιουελ Μπέκετ.',                       90, '16+'),
(3, 'Μάκβεθ',                 'Η τραγωδία του Σαίξπηρ για φιλοδοξία και εξουσία.',           135, '14+');

INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES
(1, '2026-06-10 20:00:00', 'Κεντρική Σκηνή',    300),
(1, '2026-06-11 20:00:00', 'Κεντρική Σκηνή',    300),
(2, '2026-06-14 21:00:00', 'Αίθουσα Α',         200),
(2, '2026-06-15 21:00:00', 'Αίθουσα Α',         200),
(3, '2026-06-20 20:30:00', 'Πειραματική Σκηνή',  80),
(4, '2026-06-25 19:00:00', 'Μεγάλη Αίθουσα',    250);

INSERT INTO seat_categories (showtime_id, name, price, total_seats) VALUES
(1, 'Πλατεία', 25.00, 150), (1, 'Εξώστης', 20.00, 100), (1, 'VIP', 45.00, 50),
(2, 'Πλατεία', 25.00, 150), (2, 'Εξώστης', 20.00, 100), (2, 'VIP', 45.00, 50),
(3, 'Πλατεία', 30.00, 120), (3, 'Εξώστης', 25.00, 80),
(4, 'Πλατεία', 30.00, 120), (4, 'Εξώστης', 25.00, 80),
(5, 'Γενική Είσοδος', 15.00, 80),
(6, 'Πλατεία', 28.00, 150), (6, 'Εξώστης', 22.00, 70), (6, 'VIP', 50.00, 30);

-- ============================================================
-- ΠΡΟΣΘΗΚΗ ΝΕΩΝ ΔΕΔΟΜΕΝΩΝ ΓΙΑ ΤΟ ΕΤΟΣ 2026
-- ============================================================

-- 1. Προσθήκη Νέων Θεάτρων
INSERT INTO theatres (name, location, description, phone, email)
VALUES ('Κηποθέατρο Νίκος Καζαντζάκης', 'Ηράκλειο, Κρήτη (Όαση)', 'Ανοικτό καλοκαιρινό θέατρο εντός των Ενετικών Τειχών.', '2810242240', 'kazantzakis@theatre.gr');
SET @theatre_kaz = LAST_INSERT_ID();

INSERT INTO theatres (name, location, description, phone, email)
VALUES ('Πολιτιστικό Συνεδριακό Κέντρο Ηρακλείου', 'Ηράκλειο, Κρήτη (Λεωφ. Πλαστήρα)', 'Σύγχρονο κέντρο πολιτισμού και τεχνών διεθνών προδιαγραφών.', '2810399450', 'info@cccc.gr');
SET @theatre_cccc = LAST_INSERT_ID();


-- 2. Προσθήκη Νέων Παραστάσεων
INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url)
VALUES (@theatre_kaz, 'Τρωάδες του Ευριπίδη', 'Η εμβληματική τραγωδία του Ευριπίδη σε μια σύγχρονη καλοκαιρινή περιοδεία για το 2026.', 105, '12+', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf');
SET @show_troades = LAST_INSERT_ID();

INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url)
VALUES (@theatre_cccc, 'Ο Τυχαίος Θάνατος ενός Αναρχικού', 'Η ανατρεπτική και εξαιρετικά επίκαιρη πολιτική σάτιρα του Ντάριο Φο.', 120, '15+', 'https://images.unsplash.com/photo-1503095391757-1117ec7483ba');
SET @show_anarxikos = LAST_INSERT_ID();


-- 3. Προσθήκη Προβολών (Showtimes) με έγκυρες ημερομηνίες για το 2026
-- Προβολή 1: Τρωάδες (Ιούνιος 2026)
INSERT INTO showtimes (show_id, starts_at, hall, total_seats)
VALUES (@show_troades, '2026-06-18 21:15:00', 'Κεντρική Σκηνή Κηποθεάτρου', 300);
SET @st_troades1 = LAST_INSERT_ID();

-- Προβολή 2: Τρωάδες (Ιούλιος 2026)
INSERT INTO showtimes (show_id, starts_at, hall, total_seats)
VALUES (@show_troades, '2026-07-12 21:15:00', 'Κεντρική Σκηνή Κηποθεάτρου', 300);
SET @st_troades2 = LAST_INSERT_ID();

-- Προβολή 3: Ο Τυχαίος Θάνατος ενός Αναρχικού (Ιούνιος 2026)
INSERT INTO showtimes (show_id, starts_at, hall, total_seats)
VALUES (@show_anarxikos, '2026-06-25 20:30:00', 'Αίθουσα Ανδρέας Ανδρεαδάκης', 150);
SET @st_anarxikos1 = LAST_INSERT_ID();


-- 4. Προσθήκη Κατηγοριών Θέσεων (Seat Categories) και Τιμών για τις νέες προβολές
-- Θέσεις για την 1η προβολή των Τρωάδων
INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_troades1, 'VIP / Διακεκριμένη', 25.00, 50, 0),
(@st_troades1, 'Γενική Είσοδος', 15.00, 200, 0),
(@st_troades1, 'Φοιτητικό / Μειωμένο', 12.00, 50, 0);

-- Θέσεις για την 2η προβολή των Τρωάδων
INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_troades2, 'VIP / Διακεκριμένη', 25.00, 50, 0),
(@st_troades2, 'Γενική Είσοδος', 15.00, 200, 0),
(@st_troades2, 'Φοιτητικό / Μειωμένο', 12.00, 50, 0);

-- Θέσεις για την προβολή του Αναρχικού
INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_anarxikos1, 'Ζώνη Α', 20.00, 40, 0),
(@st_anarxikos1, 'Ζώνη Β', 15.00, 90, 0),
(@st_anarxikos1, 'Ανέργων / Πολυτέκνων', 10.00, 20, 0);

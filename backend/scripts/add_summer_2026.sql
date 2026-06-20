-- ============================================================
-- ΠΡΟΣΘΗΚΗ ΕΠΙΠΛΕΟΝ ΠΑΡΑΣΤΑΣΕΩΝ ΚΑΙ ΘΕΑΤΡΩΝ ΓΙΑ ΤΟ ΚΑΛΟΚΑΙΡΙ 2026
-- ============================================================

-- 1. Προσθήκη 2 Νέων Θεάτρων
INSERT INTO theatres (name, location, description, phone, email) 
VALUES ('Θέατρο Ερωφίλη - Φορτέτζα', 'Ρέθυμνο, Κρήτη', 'Το πανέμορφο ανοιχτό θέατρο μέσα στο ενετικό κάστρο της Φορτέτζας.', '2831040140', 'erofili@rethymno.gr');
SET @theatre_erofili = LAST_INSERT_ID();

INSERT INTO theatres (name, location, description, phone, email) 
VALUES ('Αρχαίο Θέατρο Επιδαύρου', 'Επίδαυρος, Αργολίδα', 'Το διασημότερο αρχαίο θέατρο του κόσμου, παγκόσμιο μνημείο πολιτισμού με κορυφαία ακουστική.', '2103272000', 'info@aefestival.gr');
SET @theatre_epidavros = LAST_INSERT_ID();


-- 2. Προσθήκη 4 Νέων Παραστάσεων
INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url)
VALUES (@theatre_epidavros, 'Αντιγόνη του Σοφοκλή', 'Η κορυφαία τραγωδία για τη σύγκρουση μεταξύ του γραπτού νόμου του κράτους και του άγραφου νόμου της ηθικής.', 110, '12+', 'https://images.unsplash.com/photo-1505673542670-a14e06b1d1b2');
SET @show_antigone = LAST_INSERT_ID();

INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url)
VALUES (@theatre_erofili, 'Ματωμένος Γάμος - Φ. Γ. Λόρκα', 'Το ποιητικό αριστούργημα του Λόρκα, γεμάτο πάθος, ζήλια και τις παραδόσεις της ανδαλουσιανής υπαίθρου.', 95, '15+', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7');
SET @show_wedding = LAST_INSERT_ID();

INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url)
SELECT theatre_id, 'Ο Μικρός Πρίγκιπας', 'Η μαγική ιστορία του Αντουάν ντε Σαιντ-Εξυπέρυ σε μια διαδραστική παράσταση για μικρούς και μεγάλους.', 80, 'All', 'https://images.unsplash.com/photo-1534447677768-be436bb09401'
FROM theatres WHERE name = 'Κηποθέατρο Νίκος Καζαντζάκης' LIMIT 1;
SET @show_prince = LAST_INSERT_ID();

INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url)
VALUES (@theatre_erofili, 'Ο Υπηρέτης Δύο Αφεντάδων', 'Η κλασική, σπαρταριστή κωμωδία του Κάρλο Γκολντόνι γεμάτη παρεξηγήσεις, μεταμφιέσεις και γέλιο.', 100, 'All', 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212');
SET @show_servant = LAST_INSERT_ID();


-- 3. Προσθήκη Προβολών (Showtimes) εντός του καλοκαιριού του 2026
INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES 
(@show_antigone, '2026-07-24 21:00:00', 'Αρχαίο Κοίλον', 1000),
(@show_antigone, '2026-07-25 21:00:00', 'Αρχαίο Κοίλον', 1000);
SET @st_antigone1 = LAST_INSERT_ID();

INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES 
(@show_wedding, '2026-08-04 21:15:00', 'Κεντρική Σκηνή Φορτέτζας', 400);
SET @st_wedding = LAST_INSERT_ID();

INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES 
(@show_prince, '2026-07-10 19:30:00', 'Κεντρική Σκηνή Κηποθεάτρου', 300);
SET @st_prince = LAST_INSERT_ID();

INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES 
(@show_servant, '2026-09-02 21:00:00', 'Κεντρική Σκηνή Φορτέτζας', 400);
SET @st_servant = LAST_INSERT_ID();


-- 4. Προσθήκη Κατηγοριών Θέσεων (Seat Categories) και Τιμών για τις νέες προβολές
INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_antigone1, 'VIP / Κάτω Διάζωμα', 50.00, 200, 0),
(@st_antigone1, 'Ζώνη Α / Μέσο Διάζωμα', 35.00, 500, 0),
(@st_antigone1, 'Άνω Διάζωμα (Λαϊκή)', 20.00, 300, 0);

INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_wedding, 'Γενική Είσοδος', 18.00, 320, 0),
(@st_wedding, 'Φοιτητικό / Ανέργων', 14.00, 80, 0);

INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_prince, 'Κανονικό (Ενηλίκων)', 12.00, 150, 0),
(@st_prince, 'Παιδικό (έως 12 ετών)', 8.00, 150, 0);

INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES
(@st_servant, 'Γενική Είσοδος', 16.00, 300, 0),
(@st_servant, 'Μειωμένο', 12.00, 100, 0);

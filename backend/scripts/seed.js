/**
 * seed.js — Populates the database with realistic Greek theatre data.
 * Usage:  node scripts/seed.js
 *
 * ⚠️  Clears existing data (except admin user) before seeding.
 *     Safe to run multiple times.
 */

require('dotenv').config();
const db = require('../config/db');

// ─── Static Data ──────────────────────────────────────────────────────────────

const THEATRES = [
  { name: 'Εθνικό Θέατρο',                  location: 'Αθήνα, Αγίου Κωνσταντίνου 22',          description: 'Το κορυφαίο δημόσιο θέατρο της Ελλάδας, με ιστορία 130+ χρόνων.',          phone: '210-5288100', email: 'info@nationaltheatre.gr' },
  { name: 'Θέατρο Τέχνης Κάρολος Κουν',     location: 'Αθήνα, Πεσμαζόγλου 5',                  description: 'Ένα από τα σημαντικότερα πειραματικά θέατρα της Αθήνας.',                  phone: '210-3222522', email: 'info@technis.gr' },
  { name: 'Δημοτικό Θέατρο Πειραιά',        location: 'Πειραιάς, Πλατεία Κοραή',                description: 'Νεοκλασικό κτήριο-σύμβολο, έδρα πλούσιας καλλιτεχνικής παράδοσης.',      phone: '210-4123310', email: 'info@dtp.gr' },
  { name: 'Μέγαρο Μουσικής Αθηνών',         location: 'Αθήνα, Βασιλίσσης Σοφίας & Κόκκαλη',   description: 'Διεθνούς φήμης πολυχώρος τεχνών με δεκάδες εκδηλώσεις ετησίως.',         phone: '210-7282333', email: 'info@megaron.gr' },
  { name: 'Θέατρο Βάκχος',                  location: 'Αθήνα, Μισαραλιώτου 1, Θησείο',         description: 'Μικρή θεατρική σκηνή με έντονο σύγχρονο ρεπερτόριο.',                     phone: '210-3461100', email: 'tickets@vakchos.gr' },
  { name: 'Κηποθέατρο Νίκος Καζαντζάκης',   location: 'Ηράκλειο, Κρήτη (Όαση)',                 description: 'Ανοικτό καλοκαιρινό θέατρο εντός των ιστορικών Ενετικών Τειχών.',        phone: '2810242240',  email: 'kazantzakis@theatre.gr' },
  { name: 'Θέατρο Κήπου Θεσσαλονίκης',      location: 'Θεσσαλονίκη, Βασιλίσσης Όλγας 198',     description: 'Το πιο αναγνωρίσιμο ανοιχτό θέατρο της Θεσσαλονίκης.',                   phone: '2310-838634', email: 'info@theatrekipou.gr' },
  { name: 'Θέατρο Άλσους Περιστερίου',       location: 'Περιστέρι, Αθήνα',                       description: 'Ανοιχτό δημοτικό θέατρο, στολίδι των δυτικών προαστίων.',                 phone: '210-5769300', email: 'info@alsos.gr' },
  { name: 'Πολυχώρος Τέχνης Βαφείο',        location: 'Θεσσαλονίκη, Βαρδαρίου 2',               description: 'Αποθήκη-θέατρο με σύγχρονο και πειραματικό χαρακτήρα.',                  phone: '2310-544444', email: 'info@vafeio.gr' },
  { name: 'Στέγη Γραμμάτων και Τεχνών',     location: 'Αθήνα, Λεωφ. Συγγρού 107',              description: 'Το πολιτιστικό κέντρο του Ιδρύματος Ωνάση, σύμβολο σύγχρονου πολιτισμού.', phone: '210-9006000', email: 'info@onassis.org' },
  { name: 'Θέατρο Χώρα',                    location: 'Αθήνα, Ζωοδόχου Πηγής 48, Εξάρχεια',    description: 'Ιστορική θεατρική σκηνή κοντά στο Πεδίον του Άρεως.',                     phone: '210-3839305', email: 'info@theatrochora.gr' },
  { name: 'Δημοτικό Θέατρο Ρόδου',          location: 'Ρόδος, Πλατεία Ελευθερίας',              description: 'Ιστορικό θέατρο στην καρδιά της παλιάς πόλης της Ρόδου.',                 phone: '2241024626',  email: 'info@dtrodou.gr' },
];

const SHOWS = [
  { theatreIdx: 0,  title: 'Αντιγόνη',                        description: 'Η αθάνατη τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία Κ. Φιλίππου.',        duration: 120, age_rating: 'ALL', poster_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600' },
  { theatreIdx: 0,  title: 'Ο Βυσσινόκηπος',                  description: 'Το αριστούργημα του Τσέχοφ για την απώλεια, τον χρόνο και την αλλαγή.',      duration: 150, age_rating: '12+', poster_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600' },
  { theatreIdx: 1,  title: 'Το Τέλος του Παιχνιδιού',         description: 'Σκοτεινή κωμωδία του Σάμιουελ Μπέκετ για το ανθρώπινο αδιέξοδο.',           duration: 90,  age_rating: '16+', poster_url: 'https://images.unsplash.com/photo-1503095391757-1117ec7483ba?w=600' },
  { theatreIdx: 1,  title: 'Η Γυναίκα χωρίς Σκιά',            description: 'Σπάνια σε σκηνική παρουσίαση όπερα του Ρίχαρντ Στράους.',                    duration: 200, age_rating: '12+', poster_url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600' },
  { theatreIdx: 2,  title: 'Μάκβεθ',                          description: 'Η κορυφαία τραγωδία του Σαίξπηρ για φιλοδοξία, εξουσία και ενοχή.',           duration: 135, age_rating: '14+', poster_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600' },
  { theatreIdx: 3,  title: 'Αίγυπτος — Η Μεγάλη Οδύσσεια',   description: 'Εντυπωσιακό μουσικό ταξίδι στον αρχαίο πολιτισμό της Αιγύπτου.',            duration: 110, age_rating: 'ALL', poster_url: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600' },
  { theatreIdx: 4,  title: 'Δον Ζουάν',                       description: 'Η κλασική ιστορία του μεγάλου σεδυκτή σε σύγχρονη εκδοχή.',                  duration: 100, age_rating: '15+', poster_url: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=600' },
  { theatreIdx: 5,  title: 'Τρωάδες του Ευριπίδη',            description: 'Η εμβληματική τραγωδία του Ευριπίδη σε ανοιχτή καλοκαιρινή σκηνή.',          duration: 105, age_rating: '12+', poster_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600' },
  { theatreIdx: 6,  title: 'Λυσιστράτη',                      description: 'Η αριστοφανική κωμωδία σε σκηνοθεσία που ανατρέπει τα πάντα.',                duration: 95,  age_rating: '16+', poster_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600' },
  { theatreIdx: 7,  title: 'Ο Μικρός Πρίγκιπας',              description: 'Η αγαπημένη ιστορία του Σεντ-Εξιπερύ για παιδιά και γονείς.',                 duration: 75,  age_rating: 'ALL', poster_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600' },
  { theatreIdx: 8,  title: 'Ο Τυχαίος Θάνατος ενός Αναρχικού',description: 'Η ανατρεπτική πολιτική σάτιρα του Ντάριο Φο σε σπουδαία ερμηνεία.',          duration: 120, age_rating: '15+', poster_url: 'https://images.unsplash.com/photo-1503095391757-1117ec7483ba?w=600' },
  { theatreIdx: 9,  title: 'Breaking the Waves',               description: 'Βασισμένο στην ταινία του Λαρς Φον Τρίερ, παγκόσμια πρεμιέρα.',              duration: 170, age_rating: '18+', poster_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600' },
  { theatreIdx: 10, title: 'Μαύρη Κωμωδία',                   description: 'Ο Πίτερ Σάφερ σε σκηνοθεσία Μ. Αντωνόπουλου — γέλιο μέχρι δακρύων.',       duration: 100, age_rating: '14+', poster_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600' },
  { theatreIdx: 11, title: 'Ρωμαίος και Ιουλιέτα',            description: 'Η αιώνια ιστορία αγάπης του Σαίξπηρ σε ανοιχτή σκηνή με θέα θάλασσα.',      duration: 130, age_rating: '12+', poster_url: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=600' },
];

// Starting from 3 weeks from today, one show per week
function futureDate(weeksFromNow, hour = 20, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + weeksFromNow * 7);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Each show gets 2 showtimes: week N and week N+1
function buildShowtimes(showIdx) {
  const halls = ['Κεντρική Σκηνή', 'Αίθουσα Α', 'Αίθουσα Β', 'Μεγάλη Αίθουσα', 'Πειραματική Σκηνή'];
  const hall  = halls[showIdx % halls.length];
  const seats = [80, 100, 150, 200, 250, 300][showIdx % 6];
  return [
    { starts_at: futureDate(showIdx + 1, 20, 0),  hall, total_seats: seats },
    { starts_at: futureDate(showIdx + 2, 21, 0),  hall, total_seats: seats },
  ];
}

const CATEGORY_TEMPLATES = [
  [{ name: 'VIP',         price: 45.00, pct: 0.15 }, { name: 'Πλατεία', price: 25.00, pct: 0.55 }, { name: 'Εξώστης', price: 18.00, pct: 0.30 }],
  [{ name: 'Ζώνη Α',     price: 30.00, pct: 0.30 }, { name: 'Ζώνη Β',  price: 20.00, pct: 0.50 }, { name: 'Φοιτητικό', price: 12.00, pct: 0.20 }],
  [{ name: 'Διακεκριμένη', price: 35.00, pct: 0.20 }, { name: 'Γενική Είσοδος', price: 15.00, pct: 0.70 }, { name: 'Μειωμένο', price: 10.00, pct: 0.10 }],
  [{ name: 'Πλατεία',    price: 28.00, pct: 0.60 }, { name: 'Εξώστης', price: 22.00, pct: 0.30 }, { name: 'VIP',     price: 50.00, pct: 0.10 }],
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    console.log('🌱 Starting seed...');

    // Clear tables (preserving admin user if present)
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    await conn.execute('TRUNCATE TABLE reservation_items');
    await conn.execute('TRUNCATE TABLE reservations');
    await conn.execute('TRUNCATE TABLE seat_categories');
    await conn.execute('TRUNCATE TABLE showtimes');
    await conn.execute('TRUNCATE TABLE shows');
    await conn.execute('TRUNCATE TABLE theatres');
    await conn.execute('DELETE FROM users WHERE role != "admin"');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Existing data cleared.');

    // Insert test user
    await conn.execute(
      `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Test User', 'user@theatre.gr', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uivHi/oQW', 'user']
    );

    // Insert theatres
    const theatreIds = [];
    for (const t of THEATRES) {
      const [res] = await conn.execute(
        'INSERT INTO theatres (name, location, description, phone, email) VALUES (?, ?, ?, ?, ?)',
        [t.name, t.location, t.description, t.phone, t.email]
      );
      theatreIds.push(res.insertId);
    }
    console.log(`🏛️  Inserted ${theatreIds.length} theatres.`);

    // Insert shows + showtimes + seat_categories
    let showCount = 0, showtimeCount = 0, catCount = 0;

    for (let si = 0; si < SHOWS.length; si++) {
      const s = SHOWS[si];
      const theatreId = theatreIds[s.theatreIdx];

      const [showRes] = await conn.execute(
        'INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url) VALUES (?, ?, ?, ?, ?, ?)',
        [theatreId, s.title, s.description, s.duration, s.age_rating, s.poster_url]
      );
      const showId = showRes.insertId;
      showCount++;

      const showtimeDefs = buildShowtimes(si);
      const tpl = CATEGORY_TEMPLATES[si % CATEGORY_TEMPLATES.length];

      for (const st of showtimeDefs) {
        const [stRes] = await conn.execute(
          'INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES (?, ?, ?, ?)',
          [showId, st.starts_at, st.hall, st.total_seats]
        );
        const showtimeId = stRes.insertId;
        showtimeCount++;

        for (const cat of tpl) {
          const seats = Math.round(st.total_seats * cat.pct);
          await conn.execute(
            'INSERT INTO seat_categories (showtime_id, name, price, total_seats, reserved_seats) VALUES (?, ?, ?, ?, 0)',
            [showtimeId, cat.name, cat.price, seats]
          );
          catCount++;
        }
      }
    }

    await conn.commit();

    console.log(`🎭  Inserted ${showCount} shows.`);
    console.log(`🕐  Inserted ${showtimeCount} showtimes.`);
    console.log(`💺  Inserted ${catCount} seat categories.`);
    console.log('✅  Seed complete!');
  } catch (err) {
    await conn.rollback();
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();

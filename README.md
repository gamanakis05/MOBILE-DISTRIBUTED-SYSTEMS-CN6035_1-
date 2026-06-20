# 🎭 Theatre Booking App

Μια πλήρης εφαρμογή κρατήσεων θεάτρου με **React Native (Expo)** mobile app και **Node.js/Express** REST API.

---

## 📋 Περιεχόμενα

- [Σύνοψη Συστήματος](#-σύνοψη-συστήματος)
- [Τεχνολογίες](#-τεχνολογίες)
- [Απαιτήσεις](#-απαιτήσεις)
- [Εγκατάσταση & Εκτέλεση](#-εγκατάσταση--εκτέλεση)
- [Βάση Δεδομένων](#-βάση-δεδομένων)
  - [Δημιουργία Admin](#δημιουργία-νέου-admin)
- [API Endpoints](#-api-endpoints)
- [Χρήση της Εφαρμογής](#-χρήση-της-εφαρμογής)
- [Περιβάλλοντα](#-περιβάλλοντα)

---

## 🎯 Σύνοψη Συστήματος

### Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Native  │────▶│  Express API    │────▶│    MariaDB      │
│   (Expo App)    │◀────│   (Node.js)     │◀────│   (Docker)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                         │
       │                    ┌────┴────┐
       │                    │  JWT    │
       │                    │  Auth   │
       │                    └─────────┘
```

### Βασικά Χαρακτηριστικά

| Feature | Περιγραφή |
|---------|-----------|
| 🔐 **Authentication** | JWT-based με access & refresh tokens |
| 🎭 **Θέατρα** | Προβολή λίστας και λεπτομερειών θεάτρων |
| 🎬 **Παραστάσεις** | Αναζήτηση παραστάσεων ανά θέατρο |
| 🎟️ **Κρατήσεις** | Κράτηση θέσεων με κατηγορίες (VIP, Πλατεία, κλπ) |
| 👤 **Προφίλ** | Διαχείριση κρατήσεων χρήστη |
| ⚙️ **Admin Panel** | Πλήρης διαχείριση (CRUD) για όλες τις οντότητες |

---

## 🛠 Τεχνολογίες

### Backend
- **Node.js** 18+ με Express.js
- **MariaDB 10.11** (μέσω Docker)
- **JWT** authentication με refresh token rotation
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan (access logs)
- **Validation**: express-validator

### Frontend
- **React Native** 0.83+ με **Expo** 55+
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage + Expo SecureStore
- **Icons**: @expo/vector-icons (Ionicons)

### DevOps
- **Docker** & Docker Compose
- **Database migrations** με init.sql

---

## 📦 Απαιτήσεις

- [Node.js](https://nodejs.org/) 18+ και npm
- [Docker](https://docker.com/) και Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app στο κινητό (για development)

---

## 🚀 Εγκατάσταση & Εκτέλεση

### 1. Clone & Setup

```bash
# Clone το repository
git clone <repository-url>
cd theatre-app

# Εγκατάσταση backend dependencies
cd backend
npm install

# Εγκατάσταση frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=theatre_db
DB_USER=theatre_user
DB_PASSWORD=theatre_pass

JWT_SECRET=your_super_secret_access_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:8081
```

> 📋 Δες το `backend/.env.example` για παράδειγμα.

### 3. Εκτέλεση με Docker (Προτεινόμενο)

```bash
# Από το root directory
docker-compose up -d

# Έλεγχος status
docker-compose ps

# Logs
docker-compose logs -f backend
docker-compose logs -f db
```

Αυτό ξεκινάει:
- **MariaDB** στη port `3307`
- **Backend API** στη port `3000`
- Αυτόματο database seeding με demo data

### 4. Εκτέλεση Frontend

```bash
cd frontend

# iOS (απαιτεί macOS + Xcode)
npm run ios

# Android (απαιτεί Android Studio / Emulator)
npm run android

# Web (γρήγορο testing)
npm run web

# Ή χρησιμοποίησε Expo Go στο κινητό
npx expo start
# Σκανάρε το QR code με το Expo Go
```

### 5. Εκτέλεση Backend χωρίς Docker (Εναλλακτικό)

Αν προτιμάς να τρέξεις το backend τοπικά:

```bash
cd backend

# Βεβαιώσου ότι η MariaDB τρέχει (π.χ. μέσω Homebrew)
# Ρύθμισε το DB_HOST=localhost στο .env

# Development με hot-reload
npm run dev

# Ή production mode
npm start
```

---

## 🗄 Βάση Δεδομένων

### Schema Overview

| Table | Περιγραφή |
|-------|-----------|
| `users` | Χρήστες (user/admin roles) |
| `theatres` | Θέατρα με στοιχεία επικοινωνίας |
| `shows` | Παραστάσεις ανά θέατρο |
| `showtimes` | Προβολές/παραστάσεις με ώρα και αίθουσα |
| `seat_categories` | Κατηγορίες θέσεων με τιμές |
| `reservations` | Κρατήσεις χρηστών |
| `reservation_items` | Είδη κράτησης (ποσότητες ανά κατηγορία) |
| `refresh_tokens` | JWT refresh tokens |

### Demo Data (Auto-seeded)

| Entity | Περιγραφή |
|--------|-----------|
| **Admin** | `admin@theatre.gr` / `admin123` |
| **User** | `user@theatre.gr` / `password` |
| **Θέατρα** | Εθνικό Θέατρο, Θέατρο Τέχνης, Δημοτικό Πειραιά, Κηποθέατρο Καζαντζάκη, κλπ |
| **Παραστάσεις** | Αντιγόνη, Ο Βυσσινόκηπος, Τρωάδες, κλπ |

### Δημιουργία Νέου Admin

Υπάρχουν 3 τρόποι να δημιουργηθεί admin:

#### 1. SQL (Γρηγορότερος)

```bash
# Σύνδεση στη βάση
docker-compose exec db mariadb -u theatre_user -p theatre_db

# Έτοιμος admin με password "admin123"
INSERT INTO users (name, email, password, role) VALUES
('New Admin', 'newadmin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCjkSU8G.x8n3W1v3JBiZZi', 'admin');
```

Για custom password:
```bash
cd backend
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('your_password', 12).then(h => console.log(h))"
```

#### 2. Εγγραφή → Admin Upgrade

1. Εγγραφή από το app (γίνεται `user`)
2. SQL update:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

#### 3. Seed Script

Προσθήκη στο `backend/scripts/init.sql`:
```sql
INSERT INTO users (name, email, password, role) VALUES
('Teacher', 'teacher@uni.gr', '$2a$12$...hash...', 'admin');
```

Και restart: `docker-compose down -v && docker-compose up -d`

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          # Εγγραφή
POST   /api/auth/login             # Σύνδεση
POST   /api/auth/refresh           # Refresh tokens
POST   /api/auth/logout            # Αποσύνδεση
```

### Public (No Auth)
```
GET    /api/theatres               # Λίστα θεάτρων
GET    /api/theatres/:id           # Λεπτομέρειες θεάτρου
GET    /api/shows                  # Λίστα παραστάσεων
GET    /api/shows/:id              # Λεπτομέρειες παράστασης
GET    /api/showtimes/:id/seats    # Διαθέσιμες θέσεις
```

### User (Auth Required)
```
GET    /api/user/me                # Προφίλ χρήστη
GET    /api/user/reservations      # Κρατήσεις χρήστη
POST   /api/reservations           # Δημιουργία κράτησης
DELETE /api/reservations/:id       # Ακύρωση κράτησης
```

### Admin (Admin Role Required)
```
GET    /api/admin/stats            # Dashboard statistics

# Users
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id

# Reservations
GET    /api/admin/reservations
PUT    /api/admin/reservations/:id
DELETE /api/admin/reservations/:id

# Theatres CRUD
GET    /api/theatres
POST   /api/admin/theatres
PUT    /api/admin/theatres/:id
DELETE /api/admin/theatres/:id

# Shows CRUD
POST   /api/admin/shows
PUT    /api/admin/shows/:id
DELETE /api/admin/shows/:id

# Showtimes CRUD
POST   /api/admin/showtimes
PUT    /api/admin/showtimes/:id
DELETE /api/admin/showtimes/:id
```

### Health Check
```
GET    /health                     # API status
```

---

## 📱 Χρήση της Εφαρμογής

### 1. Εγγραφή / Σύνδεση

- Άνοιξε την εφαρμογή
- Δημιούργησε λογαριασμό ή σύνδεση με τα demo credentials
- Τα tokens αποθηκεύονται αυτόματα

### 2. Αναζήτηση Παραστάσεων

- **Tab "Παραστάσεις"**: Δες όλες τις διαθέσιμες παραστάσεις
- **Tab "Θέατρα"**: Περιήγηση ανά θέατρο
- Πάτησε μια παράσταση για λεπτομέρειες

### 3. Κράτηση Θέσης

1. Επίλεξε παράσταση
2. Διάλεξε προβολή (ημερομηνία/ώρα)
3. Επίλεξε κατηγορία θέσεων (VIP, Πλατεία, κλπ)
4. Διάλεξε ποσότητα
5. Επιβεβαίωση κράτησης

### 4. Προφίλ & Κρατήσεις

- **Tab "Προφίλ"**: Δες τις κρατήσεις σου
- Πάτησε ⚙️ για Ρυθμίσεις / Admin Panel

### 5. Admin Panel (μόνο για admin users)

Διαθέσιμα από το Settings:
- **Dashboard**: Στατιστικά (users, theatres, shows, revenue)
- **Χρήστες**: CRUD χρηστών
- **Κρατήσεις**: Διαχείριση όλων των κρατήσεων
- **Θέατρα**: Προσθήκη/Επεξεργασία/Διαγραφή
- **Παραστάσεις**: Διαχείριση παραστάσεων
- **Προβολές**: Χρονοδιάγραμμα προβολών

---

## 🔧 Περιβάλλοντα

### Development
```bash
# Backend
PORT=3000
NODE_ENV=development
DB_HOST=localhost

# Frontend (Expo)
# API URL στο api.js → http://localhost:3000/api
```

### Production Checklist
- [ ] Αλλαγή JWT secrets
- [ ] Αλλαγή database passwords
- [ ] Ρύθμιση `FRONTEND_URL`
- [ ] Enable HTTPS
- [ ] Database backups
- [ ] Environment variables στο server

---

## 🐛 Troubleshooting

### Database connection error
```bash
# Έλεγξε αν το container τρέχει
docker-compose ps

# Restart
docker-compose restart db

# Logs
docker-compose logs db
```

### API not responding
```bash
# Έλεγξε health endpoint
curl http://localhost:3000/health

# Backend logs
docker-compose logs backend
```

### Expo connection issues
- Βεβαιώσου ότι κινητό και computer είναι στο ίδιο WiFi
- Έλεγξε το API URL στο `frontend/src/services/api.js`
- Χρησιμοποίησε `npx expo start --tunnel` για remote access

---

## 📁 Project Structure

```
theatre-app/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Route handlers
│   ├── middlewares/     # Auth, error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── scripts/         # init.sql, seed.js
│   ├── services/        # Business logic
│   ├── utils/           # Helpers
│   ├── server.js        # Entry point
│   └── .env             # Environment vars
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI
│   │   ├── context/     # AuthContext
│   │   ├── hooks/       # Custom hooks
│   │   ├── navigation/  # Navigators
│   │   ├── screens/     # App screens
│   │   │   └── admin/   # Admin screens
│   │   ├── services/    # API calls
│   │   └── utils/       # Theme, helpers
│   ├── App.js
│   └── app.json
│
├── docker-compose.yml
└── README.md
```

---

## 📄 License

MIT License - Δες το LICENSE file για λεπτομέρειες.

---

## 🤝 Support

Για issues ή questions, δημιούργησε ένα GitHub issue.

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

// ─── USERS ────────────────────────────────────────────────────────────────────

const getAllUsers = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC`
  );
  res.json({ success: true, data: rows });
});

const getUserById = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?`,
    [req.params.id]
  );
  if (!rows.length) throw new AppError('User not found.', 404);
  res.json({ success: true, data: rows[0] });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;
  const fields = [];
  const params = [];

  if (name)     { fields.push('name = ?');     params.push(name); }
  if (email)    { fields.push('email = ?');    params.push(email); }
  if (role)     { fields.push('role = ?');     params.push(role); }
  if (password) {
    fields.push('password = ?');
    params.push(await bcrypt.hash(password, 12));
  }

  if (!fields.length) throw new AppError('Nothing to update.', 400);
  params.push(req.params.id);

  await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, params);
  res.json({ success: true, message: 'User updated.' });
});

const deleteUser = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM users WHERE user_id = ?', [req.params.id]);
  if (!result.affectedRows) throw new AppError('User not found.', 404);
  res.json({ success: true, message: 'User deleted.' });
});

// ─── RESERVATIONS (admin view all) ───────────────────────────────────────────

const getAllReservations = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(`
    SELECT r.reservation_id, r.status, r.total_amount, r.created_at,
           u.name AS user_name, u.email AS user_email,
           st.starts_at, st.hall,
           s.title AS show_title,
           t.name  AS theatre_name
    FROM reservations r
    JOIN users     u  ON u.user_id       = r.user_id
    JOIN showtimes st ON st.showtime_id  = r.showtime_id
    JOIN shows     s  ON s.show_id       = st.show_id
    JOIN theatres  t  ON t.theatre_id    = s.theatre_id
    ORDER BY r.created_at DESC
  `);
  res.json({ success: true, data: rows });
});

const adminUpdateReservation = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending','confirmed','cancelled'].includes(status)) {
    throw new AppError('Invalid status.', 400);
  }
  await db.execute(
    'UPDATE reservations SET status = ? WHERE reservation_id = ?',
    [status, req.params.id]
  );
  res.json({ success: true, message: 'Reservation updated.' });
});

const adminDeleteReservation = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    'DELETE FROM reservations WHERE reservation_id = ?',
    [req.params.id]
  );
  if (!result.affectedRows) throw new AppError('Reservation not found.', 404);
  res.json({ success: true, message: 'Reservation deleted.' });
});

// ─── THEATRES (admin CRUD) ────────────────────────────────────────────────────

const createTheatre = asyncHandler(async (req, res) => {
  const { name, location, description, phone, email } = req.body;
  if (!name || !location) throw new AppError('Name and location are required.', 400);

  const [result] = await db.execute(
    'INSERT INTO theatres (name, location, description, phone, email) VALUES (?, ?, ?, ?, ?)',
    [name, location, description || null, phone || null, email || null]
  );
  res.status(201).json({ success: true, data: { theatre_id: result.insertId } });
});

const updateTheatre = asyncHandler(async (req, res) => {
  const { name, location, description, phone, email } = req.body;
  const fields = [];
  const params = [];

  if (name)        { fields.push('name = ?');        params.push(name); }
  if (location)    { fields.push('location = ?');    params.push(location); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (phone !== undefined)       { fields.push('phone = ?');       params.push(phone); }
  if (email !== undefined)       { fields.push('email = ?');       params.push(email); }

  if (!fields.length) throw new AppError('Nothing to update.', 400);
  params.push(req.params.id);

  await db.execute(`UPDATE theatres SET ${fields.join(', ')} WHERE theatre_id = ?`, params);
  res.json({ success: true, message: 'Theatre updated.' });
});

const deleteTheatre = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM theatres WHERE theatre_id = ?', [req.params.id]);
  if (!result.affectedRows) throw new AppError('Theatre not found.', 404);
  res.json({ success: true, message: 'Theatre deleted.' });
});

// ─── SHOWS (admin CRUD) ───────────────────────────────────────────────────────

const createShow = asyncHandler(async (req, res) => {
  const { theatre_id, title, description, duration, age_rating, poster_url } = req.body;
  if (!theatre_id || !title || !duration) {
    throw new AppError('theatre_id, title and duration are required.', 400);
  }

  const [result] = await db.execute(
    'INSERT INTO shows (theatre_id, title, description, duration, age_rating, poster_url) VALUES (?, ?, ?, ?, ?, ?)',
    [theatre_id, title, description || null, duration, age_rating || 'ALL', poster_url || null]
  );
  res.status(201).json({ success: true, data: { show_id: result.insertId } });
});

const updateShow = asyncHandler(async (req, res) => {
  const { title, description, duration, age_rating, poster_url, theatre_id } = req.body;
  const fields = [];
  const params = [];

  if (title)       { fields.push('title = ?');       params.push(title); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (duration)    { fields.push('duration = ?');    params.push(duration); }
  if (age_rating)  { fields.push('age_rating = ?');  params.push(age_rating); }
  if (poster_url !== undefined)  { fields.push('poster_url = ?');  params.push(poster_url); }
  if (theatre_id)  { fields.push('theatre_id = ?');  params.push(theatre_id); }

  if (!fields.length) throw new AppError('Nothing to update.', 400);
  params.push(req.params.id);

  await db.execute(`UPDATE shows SET ${fields.join(', ')} WHERE show_id = ?`, params);
  res.json({ success: true, message: 'Show updated.' });
});

const deleteShow = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM shows WHERE show_id = ?', [req.params.id]);
  if (!result.affectedRows) throw new AppError('Show not found.', 404);
  res.json({ success: true, message: 'Show deleted.' });
});

// ─── SHOWTIMES (admin CRUD) ───────────────────────────────────────────────────

const createShowtime = asyncHandler(async (req, res) => {
  const { show_id, starts_at, hall, total_seats } = req.body;
  if (!show_id || !starts_at || !hall) {
    throw new AppError('show_id, starts_at and hall are required.', 400);
  }

  const [result] = await db.execute(
    'INSERT INTO showtimes (show_id, starts_at, hall, total_seats) VALUES (?, ?, ?, ?)',
    [show_id, starts_at, hall, total_seats || 100]
  );
  res.status(201).json({ success: true, data: { showtime_id: result.insertId } });
});

const updateShowtime = asyncHandler(async (req, res) => {
  const { starts_at, hall, total_seats } = req.body;
  const fields = [];
  const params = [];

  if (starts_at)   { fields.push('starts_at = ?');   params.push(starts_at); }
  if (hall)        { fields.push('hall = ?');         params.push(hall); }
  if (total_seats) { fields.push('total_seats = ?');  params.push(total_seats); }

  if (!fields.length) throw new AppError('Nothing to update.', 400);
  params.push(req.params.id);

  await db.execute(`UPDATE showtimes SET ${fields.join(', ')} WHERE showtime_id = ?`, params);
  res.json({ success: true, message: 'Showtime updated.' });
});

const deleteShowtime = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM showtimes WHERE showtime_id = ?', [req.params.id]);
  if (!result.affectedRows) throw new AppError('Showtime not found.', 404);
  res.json({ success: true, message: 'Showtime deleted.' });
});

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

const getDashboardStats = asyncHandler(async (req, res) => {
  const [[users]]        = await db.execute('SELECT COUNT(*) AS count FROM users');
  const [[theatres]]     = await db.execute('SELECT COUNT(*) AS count FROM theatres');
  const [[shows]]        = await db.execute('SELECT COUNT(*) AS count FROM shows');
  const [[showtimes]]    = await db.execute('SELECT COUNT(*) AS count FROM showtimes');
  const [[reservations]] = await db.execute('SELECT COUNT(*) AS count FROM reservations');
  const [[revenue]]      = await db.execute(
    "SELECT COALESCE(SUM(total_amount),0) AS total FROM reservations WHERE status = 'confirmed'"
  );

  res.json({
    success: true,
    data: {
      users:        users.count,
      theatres:     theatres.count,
      shows:        shows.count,
      showtimes:    showtimes.count,
      reservations: reservations.count,
      revenue:      parseFloat(revenue.total),
    },
  });
});

module.exports = {
  getAllUsers, getUserById, updateUser, deleteUser,
  getAllReservations, adminUpdateReservation, adminDeleteReservation,
  createTheatre, updateTheatre, deleteTheatre,
  createShow, updateShow, deleteShow,
  createShowtime, updateShowtime, deleteShowtime,
  getDashboardStats,
};

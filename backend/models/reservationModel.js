const db = require('../config/db');

/**
 * Reservation Model
 */
class ReservationModel {
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT r.*, st.starts_at, st.hall, s.title AS show_title, t.name AS theatre_name
       FROM reservations r
       JOIN showtimes st ON st.showtime_id = r.showtime_id
       JOIN shows     s  ON s.show_id      = st.show_id
       JOIN theatres  t  ON t.theatre_id   = s.theatre_id
       WHERE r.reservation_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findItemsByReservationId(reservationId) {
    const [rows] = await db.execute(
      `SELECT ri.*, sc.name AS category_name
       FROM reservation_items ri
       JOIN seat_categories sc ON sc.category_id = ri.category_id
       WHERE ri.reservation_id = ?`,
      [reservationId]
    );
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT r.reservation_id, r.status, r.total_amount, r.created_at,
              st.starts_at, st.hall,
              s.title AS show_title, s.duration,
              t.name AS theatre_name
       FROM reservations r
       JOIN showtimes st ON st.showtime_id = r.showtime_id
       JOIN shows     s  ON s.show_id      = st.show_id
       JOIN theatres  t  ON t.theatre_id   = s.theatre_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Note: These need to be run within a transaction
  static async create(conn, { userId, showtimeId, totalAmount }) {
    const [result] = await conn.execute(
      'INSERT INTO reservations (user_id, showtime_id, total_amount) VALUES (?, ?, ?)',
      [userId, showtimeId, totalAmount]
    );
    return result.insertId;
  }

  static async createItem(conn, { reservationId, categoryId, quantity, unitPrice }) {
    await conn.execute(
      'INSERT INTO reservation_items (reservation_id, category_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [reservationId, categoryId, quantity, unitPrice]
    );
  }

  static async updateStatus(conn, reservationId, status) {
    await conn.execute(
      "UPDATE reservations SET status = ? WHERE reservation_id = ?",
      [status, reservationId]
    );
  }

  static async findByIdWithLock(conn, id) {
    const [rows] = await conn.execute(
      `SELECT r.*, st.starts_at FROM reservations r
       JOIN showtimes st ON st.showtime_id = r.showtime_id
       WHERE r.reservation_id = ? FOR UPDATE`,
      [id]
    );
    return rows[0];
  }
}

module.exports = ReservationModel;

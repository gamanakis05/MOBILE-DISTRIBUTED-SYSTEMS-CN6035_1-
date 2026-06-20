const db = require('../config/db');

/**
 * Seat Model
 */
class SeatModel {
  static async findByShowtime(showtimeId) {
    const [rows] = await db.execute(
      'SELECT * FROM seat_categories WHERE showtime_id = ? ORDER BY price DESC',
      [showtimeId]
    );
    return rows;
  }

  static async findCategoryById(categoryId) {
    const [rows] = await db.execute(
      'SELECT * FROM seat_categories WHERE category_id = ?',
      [categoryId]
    );
    return rows[0];
  }

  static async updateReservedSeats(conn, categoryId, quantity) {
    await conn.execute(
      'UPDATE seat_categories SET reserved_seats = reserved_seats + ? WHERE category_id = ?',
      [quantity, categoryId]
    );
  }
}

module.exports = SeatModel;

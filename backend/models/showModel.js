const db = require('../config/db');

/**
 * Show Model
 */
class ShowModel {
  static async findAll({ theatreId, title, date }) {
    let sql = `
      SELECT s.*, t.name AS theatre_name, t.location AS theatre_location
      FROM shows s
      JOIN theatres t ON t.theatre_id = s.theatre_id
      WHERE 1=1
    `;
    const params = [];

    if (theatreId) {
      sql += ' AND s.theatre_id = ?';
      params.push(theatreId);
    }
    if (title) {
      sql += ' AND s.title LIKE ?';
      params.push(`%${title}%`);
    }
    if (date) {
      sql += ` AND EXISTS (
        SELECT 1 FROM showtimes st
        WHERE st.show_id = s.show_id AND DATE(st.starts_at) = ?
      )`;
      params.push(date);
    }

    sql += ' ORDER BY s.title ASC';
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT s.*, t.name AS theatre_name, t.location AS theatre_location
       FROM shows s JOIN theatres t ON t.theatre_id = s.theatre_id
       WHERE s.show_id = ?`,
      [id]
    );
    return rows[0];
  }
}

module.exports = ShowModel;

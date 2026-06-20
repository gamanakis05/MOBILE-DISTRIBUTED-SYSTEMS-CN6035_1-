const db = require('../config/db');

/**
 * Showtime Model
 */
class ShowtimeModel {
  static async findAll({ showId, date }) {
    let sql = `
      SELECT st.*, s.title AS show_title, t.name AS theatre_name
      FROM showtimes st
      JOIN shows s ON s.show_id = st.show_id
      JOIN theatres t ON t.theatre_id = s.theatre_id
      WHERE 1=1
    `;
    const params = [];

    if (showId) {
      sql += ' AND st.show_id = ?';
      params.push(showId);
    }
    if (date) {
      sql += ' AND DATE(st.starts_at) = ?';
      params.push(date);
    }

    sql += ' ORDER BY st.starts_at ASC';
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT st.*, s.title AS show_title, t.name AS theatre_name
       FROM showtimes st
       JOIN shows s ON s.show_id = st.show_id
       JOIN theatres t ON t.theatre_id = s.theatre_id
       WHERE st.showtime_id = ?`,
      [id]
    );
    return rows[0];
  }
}

module.exports = ShowtimeModel;

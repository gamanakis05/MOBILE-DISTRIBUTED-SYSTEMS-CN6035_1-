const db = require('../config/db');

/**
 * Theatre Model
 */
class TheatreModel {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM theatres ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM theatres WHERE theatre_id = ?', [id]);
    return rows[0];
  }
}

module.exports = TheatreModel;

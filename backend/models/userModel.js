const db = require('../config/db');

/**
 * User Model
 */
class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows[0];
  }

  static async create(name, email, hashedPassword) {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  static async updateProfile(userId, { name, password }) {
    let sql = 'UPDATE users SET ';
    const params = [];
    const fields = [];

    if (name) {
      fields.push('name = ?');
      params.push(name);
    }
    if (password) {
      fields.push('password = ?');
      params.push(password);
    }

    if (fields.length === 0) return;

    sql += fields.join(', ') + ' WHERE user_id = ?';
    params.push(userId);

    await db.execute(sql, params);
  }
}

module.exports = UserModel;

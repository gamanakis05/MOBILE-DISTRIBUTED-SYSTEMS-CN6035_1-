const db = require('../config/db');

/**
 * Refresh Token Model
 */
class RefreshTokenModel {
  static async create(userId, token, expiresAt) {
    await db.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  static async findValidToken(token) {
    const [rows] = await db.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }

  static async delete(token) {
    await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }

  static async deleteByUserId(userId) {
    await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }
}

module.exports = RefreshTokenModel;

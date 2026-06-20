const db = require('../config/db');
const ReservationModel = require('../models/reservationModel');
const SeatModel = require('../models/seatModel');
const AppError = require('../utils/AppError');

const createReservation = async (userId, { showtimeId, items }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock and fetch seat categories
    const categoryIds = items.map(i => i.categoryId);
    const [cats] = await conn.execute(
      `SELECT * FROM seat_categories WHERE category_id IN (${categoryIds.map(() => '?').join(',')}) AND showtime_id = ? FOR UPDATE`,
      [...categoryIds, showtimeId]
    );

    if (cats.length !== items.length) {
      throw new AppError('One or more categories not found for this showtime.', 404);
    }

    // Availability & pricing check
    let totalAmount = 0;
    const itemsToProcess = [];
    for (const item of items) {
      const cat = cats.find(c => c.category_id === item.categoryId);
      const available = cat.total_seats - cat.reserved_seats;
      if (item.quantity > available) {
        throw new AppError(`Not enough seats in category "${cat.name}". Available: ${available}.`, 409);
      }
      totalAmount += cat.price * item.quantity;
      itemsToProcess.push({ ...item, unitPrice: cat.price });
    }

    // Create reservation
    const reservationId = await ReservationModel.create(conn, { userId, showtimeId, totalAmount });

    // Process items
    for (const item of itemsToProcess) {
      await ReservationModel.createItem(conn, {
        reservationId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      });

      await SeatModel.updateReservedSeats(conn, item.categoryId, item.quantity);
    }

    await conn.commit();

    // Fetch final result
    const reservation = await ReservationModel.findById(reservationId);
    const reservedItems = await ReservationModel.findItemsByReservationId(reservationId);

    return { ...reservation, items: reservedItems };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const cancelReservation = async (userId, userRole, reservationId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const reservation = await ReservationModel.findByIdWithLock(conn, reservationId);

    if (!reservation) throw new AppError('Reservation not found.', 404);
    if (reservation.user_id !== userId && userRole !== 'admin') {
      throw new AppError('Forbidden: you can only cancel your own reservations.', 403);
    }
    if (reservation.status === 'cancelled') {
      throw new AppError('Reservation already cancelled.', 400);
    }
    const now = new Date();
    const startsAt = new Date(reservation.starts_at);
    if (startsAt < now) {
      throw new AppError('Cannot cancel past reservations.', 400);
    }
    const hoursUntilShow = (startsAt - now) / (1000 * 60 * 60);
    if (hoursUntilShow < 24) {
      throw new AppError('Cancellation is only allowed up to 24 hours before the show.', 400);
    }

    // Release seats
    const items = await ReservationModel.findItemsByReservationId(reservationId);
    for (const item of items) {
      await SeatModel.updateReservedSeats(conn, item.category_id, -item.quantity);
    }

    await ReservationModel.updateStatus(conn, reservationId, 'cancelled');

    await conn.commit();
    return { message: 'Reservation cancelled successfully.' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getUserReservations = async (userId) => {
  return await ReservationModel.findByUserId(userId);
};

const getReservationById = async (userId, userRole, reservationId) => {
  const reservation = await ReservationModel.findById(reservationId);
  if (!reservation) throw new AppError('Reservation not found.', 404);

  if (reservation.user_id !== userId && userRole !== 'admin') {
    throw new AppError('Forbidden: you can only view your own reservations.', 403);
  }

  const items = await ReservationModel.findItemsByReservationId(reservationId);
  return { ...reservation, items };
};

module.exports = {
  createReservation,
  cancelReservation,
  getUserReservations,
  getReservationById,
};

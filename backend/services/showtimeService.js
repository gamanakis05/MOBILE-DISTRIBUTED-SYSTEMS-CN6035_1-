const ShowtimeModel = require('../models/showtimeModel');
const AppError = require('../utils/AppError');

const getShowtimes = async (filters) => {
  return await ShowtimeModel.findAll(filters);
};

const getShowtimeById = async (id) => {
  const showtime = await ShowtimeModel.findById(id);
  if (!showtime) throw new AppError('Showtime not found.', 404);
  return showtime;
};

module.exports = {
  getShowtimes,
  getShowtimeById,
};

const ShowModel = require('../models/showModel');
const AppError = require('../utils/AppError');

const getShows = async (filters) => {
  return await ShowModel.findAll(filters);
};

const getShowById = async (id) => {
  const show = await ShowModel.findById(id);
  if (!show) throw new AppError('Show not found.', 404);
  return show;
};

const getUpcomingShows = async () => {
  return await ShowModel.findUpcoming();
};

module.exports = {
  getShows,
  getShowById,
  getUpcomingShows,
};

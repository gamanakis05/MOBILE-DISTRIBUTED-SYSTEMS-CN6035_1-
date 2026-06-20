const TheatreModel = require('../models/theatreModel');
const AppError = require('../utils/AppError');

const getTheatres = async () => {
  return await TheatreModel.findAll();
};

const getTheatreById = async (id) => {
  const theatre = await TheatreModel.findById(id);
  if (!theatre) throw new AppError('Theatre not found.', 404);
  return theatre;
};

module.exports = {
  getTheatres,
  getTheatreById,
};

const theatreService = require('../services/theatreService');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * GET /theatres
 */
const getTheatres = asyncHandler(async (req, res) => {
  const theatres = await theatreService.getTheatres();

  res.json({
    success: true,
    data: theatres
  });
});

/**
 * GET /theatres/:id
 */
const getTheatreById = asyncHandler(async (req, res) => {
  const theatre = await theatreService.getTheatreById(req.params.id);

  res.json({
    success: true,
    data: theatre
  });
});

module.exports = { getTheatres, getTheatreById };

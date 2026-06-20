const showtimeService = require('../services/showtimeService');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * GET /showtimes
 */
const getShowtimes = asyncHandler(async (req, res) => {
  const { showId, date } = req.query;
  const showtimes = await showtimeService.getShowtimes({ showId, date });

  res.json({
    success: true,
    data: showtimes
  });
});

/**
 * GET /showtimes/:id
 */
const getShowtimeById = asyncHandler(async (req, res) => {
  const showtime = await showtimeService.getShowtimeById(req.params.id);

  res.json({
    success: true,
    data: showtime
  });
});

module.exports = { getShowtimes, getShowtimeById };

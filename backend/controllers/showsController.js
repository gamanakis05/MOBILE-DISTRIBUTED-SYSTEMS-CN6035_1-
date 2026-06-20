const showService = require('../services/showService');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * GET /shows
 */
const getShows = asyncHandler(async (req, res) => {
  const { theatreId, title, date } = req.query;
  const shows = await showService.getShows({ theatreId, title, date });

  res.json({
    success: true,
    data: shows
  });
});

/**
 * GET /shows/:id
 */
const getShowById = asyncHandler(async (req, res) => {
  const show = await showService.getShowById(req.params.id);

  res.json({
    success: true,
    data: show
  });
});

/**
 * GET /shows/upcoming
 * Επιστρέφει μόνο τις μελλοντικές παραστάσεις του 2026
 */
const getUpcomingShows = asyncHandler(async (req, res) => {
  const shows = await showService.getUpcomingShows();
  res.json({
    success: true,
    data: shows
  });
});

module.exports = { getShows, getShowById, getUpcomingShows };

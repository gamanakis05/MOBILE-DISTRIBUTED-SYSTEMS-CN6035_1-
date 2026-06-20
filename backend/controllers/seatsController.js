const SeatModel = require('../models/seatModel');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * GET /seats?showtimeId=...
 */
const getSeatsByShowtime = asyncHandler(async (req, res) => {
  const { showtimeId } = req.query;
  const seats = await SeatModel.findByShowtime(showtimeId);

  res.json({
    success: true,
    data: seats
  });
});

module.exports = { getSeatsByShowtime };

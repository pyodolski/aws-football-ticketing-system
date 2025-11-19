const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// 경기 목록 조회
router.get("/", async (req, res) => {
  try {
    const [matches] = await pool.query(
      'SELECT * FROM matches WHERE status = "upcoming" ORDER BY match_date ASC'
    );

    res.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("경기 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 티켓 예매
router.post("/book", async (req, res) => {
  const { userId, matchId, seatNumber } = req.body;

  try {
    // 경기 정보 조회
    const [matches] = await pool.query("SELECT * FROM matches WHERE id = ?", [
      matchId,
    ]);

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "경기를 찾을 수 없습니다.",
      });
    }

    const match = matches[0];

    // 좌석 중복 체크
    const [existing] = await pool.query(
      "SELECT id FROM bookings WHERE match_id = ? AND seat_number = ?",
      [matchId, seatNumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "이미 예매된 좌석입니다.",
      });
    }

    // 예매 생성
    await pool.query(
      'INSERT INTO bookings (user_id, match_id, seat_number, booking_status, total_price) VALUES (?, ?, ?, "confirmed", ?)',
      [userId, matchId, seatNumber, match.price]
    );

    // 남은 좌석 수 감소
    await pool.query(
      "UPDATE matches SET available_seats = available_seats - 1 WHERE id = ?",
      [matchId]
    );

    res.json({
      success: true,
      message: "예매가 완료되었습니다.",
    });
  } catch (error) {
    console.error("예매 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 내 예매 내역
router.get("/my-bookings/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [bookings] = await pool.query(
      `SELECT b.*, m.home_team, m.away_team, m.match_date, m.stadium 
       FROM bookings b 
       JOIN matches m ON b.match_id = m.id 
       WHERE b.user_id = ? 
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("예매 내역 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

module.exports = router;

// 예매된 좌석 조회
router.get("/:matchId/booked-seats", async (req, res) => {
  const { matchId } = req.params;

  try {
    const [bookings] = await pool.query(
      "SELECT seat_number FROM bookings WHERE match_id = ?",
      [matchId]
    );

    const bookedSeats = bookings.map((b) => b.seat_number);

    res.json({
      success: true,
      bookedSeats,
    });
  } catch (error) {
    console.error("예매된 좌석 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

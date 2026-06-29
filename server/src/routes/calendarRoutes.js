const express = require("express");

const router = express.Router();

const {
    googleAuth,
    googleCallback,
    getCalendarStatus,
    addDailyPlanToCalendar,
} = require("../controllers/calendarController");
const { authentication } = require("../middleware/auth");

router.get("/auth",authentication,googleAuth);

router.get("/oauth2callback",googleCallback);
router.get("/status",authentication,getCalendarStatus);
router.post("/add-plan",authentication,addDailyPlanToCalendar);

module.exports = router;

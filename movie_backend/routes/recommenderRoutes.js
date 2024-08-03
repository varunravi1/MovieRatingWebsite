const express = require("express");
const axios = require("axios");
const cors = require("cors");
const router = express.Router();
const {
  getRecommendationsGeneral,
  getRecommendationsUser,
} = require("../controllers/recommenderController");
router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://4r8z3n3m-5173.use.devtunnels.ms",
    ],
  })
);

router.post("/user", getRecommendationsUser);
router.post("/general", getRecommendationsGeneral);

module.exports = router;

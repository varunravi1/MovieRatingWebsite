const express = require("express");
const axios = require("axios");
const cors = require("cors");
const {
  getMovieModern,
  getMovieClassic,
  getMovieMillennium,
  putMovie,
} = require("../controllers/moviedleController");
const router = express.Router();
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
// router.get("/putMovie", putMovie);
router.get("/getMovieModern", getMovieModern);
router.get("/getMovieMillennium", getMovieMillennium);
router.get("/getMovieClassic", getMovieClassic);

module.exports = router;

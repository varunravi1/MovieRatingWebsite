const express = require("express");
const axios = require("axios");
const {
  scraper,
  requestScroller,
  searchFunc,
  getMovies,
  getTV,
  getWatchProviders,
  getMovieRatings,
  getActorInformation,
} = require("../controllers/tmdbController");
const cors = require("cors");
const router = express.Router();
router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/scores", scraper);
router.get("/scroller", requestScroller);
router.post("/search", searchFunc);
router.post("/movies", getMovies);
router.post("/tv", getTV);
router.post("/watchProvider", getWatchProviders);
router.post("/ratings", getMovieRatings);
router.post("/actor", getActorInformation);
module.exports = router;

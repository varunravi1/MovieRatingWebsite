const express = require("express");
const axios = require("axios");
const {
  scraper,
  requestScrollerMovie,
  requestScrollerTV,
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
    origin: [
      "http://localhost:5173",
      "https://4r8z3n3m-5173.use.devtunnels.ms",
    ],
  })
);
// router.use(
//   cors({
//     //cors basiaclly authorizes the requests sent from localhost:5173
//     credentials: true,
//     origin: "http://localhost:5173",
//   })
// );
router.post("/scores", scraper);
router.get("/scroller/movie", requestScrollerMovie);
router.get("/scroller/tv", requestScrollerTV);
router.post("/search", searchFunc);
router.post("/movies", getMovies);
router.post("/tv", getTV);
router.post("/watchProvider", getWatchProviders);
router.post("/ratings", getMovieRatings);
router.post("/actor", getActorInformation);
module.exports = router;

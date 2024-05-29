const express = require("express");
const axios = require("axios");
const {
  scraper,
  requestScroller,
  searchFunc,
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
module.exports = router;

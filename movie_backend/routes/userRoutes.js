const express = require("express");
const axios = require("axios");
const { authenticateUser } = require("../controllers/userController");
const { scraper } = require("../controllers/tmdbController");
const cors = require("cors");
const router = express.Router();

router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: "http://localhost:5173",
  })
);
// router.use(authenticateUser);
router.get("/", (req, res) => {
  if (req.decoded) {
    res.json({ user: req.decoded });
  } else {
    res.json("Token Is Wrong");
  }
});
router.get("/scroll", async (req, res) => {
  const query = "Jack+Reacher";
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&api_key=8fa4fa6e422540365b21966c86cd2f9a`
    );
    console.log(response.data);
  } catch (error) {
    console.error("Failed to fetch data from api");
  }
});
router.post("/scores", scraper);
router.get("/homepage", (req, res) => {});

module.exports = router;

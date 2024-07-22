const express = require("express");
const axios = require("axios");
const cors = require("cors");
const router = express.Router();
router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/", async (req, res) => {
  //   console.log(req.body.type);
  const type = req.body.type;
  const id = req.body.id;
  const urlMedia = `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API}`;
  const urlCredits = `https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${process.env.TMDB_API}`;
  const urlTrailer = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${process.env.TMDB_API}`;
  const urlStreaming = "";
  const [mediaResult, creditResult, trailerResult] = await Promise.all([
    axios.get(urlMedia),
    axios.get(urlCredits),
    axios.get(urlTrailer),
  ]);
  const trailerLinks = trailerResult.data.results.find(
    (trailer) => trailer.type === "Trailer"
  );
  const actors = creditResult.data.cast
    .filter((member) => member.known_for_department === "Acting")
    .slice(0, 15);
  const director = creditResult.data.crew.find(
    (crew) => crew.job === "Director"
  );
  //   console.log(actors);
  res.json({
    mediaData: mediaResult.data,
    trailer: trailerLinks,
    cast: actors,
    director: director,
  });
  //   console.log(result.data);
});
module.exports = router;

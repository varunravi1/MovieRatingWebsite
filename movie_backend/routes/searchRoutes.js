const express = require("express");
const axios = require("axios");
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
router.post("/", async (req, res) => {
  const type = req.body.type;
  const id = req.body.id;
  const urlMedia = `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API}&append_to_response=credits%2Cvideos%2Cimages%2Ckeywords`;
  const response = await axios.get(urlMedia);
  res.json(response.data);
});
module.exports = router;

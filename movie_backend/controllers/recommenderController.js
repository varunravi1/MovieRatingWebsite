const axios = require("axios");
const RECOMMENDER_URL = "http://localhost:5000";
const getRecommendationsUser = async (req, res) => {};

const getRecommendationsGeneral = async (req, res) => {
  try {
    const id = req.body.id;
    const recommendations = await req.redisClient.get(`reco-${id}`);
    if (recommendations != null) {
      console.log("cache hit recommendations");
      res.json(JSON.parse(recommendations));
    } else {
      const response = await axios.post(
        `${RECOMMENDER_URL}/recommend/general`,
        {
          movie_id: id,
        }
      );
      await req.redisClient.set(
        `reco-${id}`,
        JSON.stringify(response.data.recommendations)
      );
      console.log(response.data.recommendations);
      res.json(response.data.recommendations);
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

module.exports = {
  getRecommendationsUser,
  getRecommendationsGeneral,
};

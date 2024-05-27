const axios = require("axios");
const cheerio = require("cheerio");

export const scrapeAudienceScore = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // The CSS selector might change depending on the website's structure at the time you are scraping
    const criticsScoreElement = $('rt-button[slot="criticsScore"] rt-text');
    const criticsScore = criticsScoreElement.text().trim();
    const audienceScoreElement = $('rt-button[slot="audienceScore"] rt-text');
    const audienceScore = audienceScoreElement.text().trim();
    return {
      criticsScore: criticsScore ? criticsScore : "Not found",
      audienceScore: audienceScore ? audienceScore : "Not found",
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// Example URL - replace with the actual movie page you want to scrape
const movieUrl = "https://www.rottentomatoes.com/m/the_fall_guy_2024";
scrapeAudienceScore(movieUrl).then((score) =>
  console.log("Audience Score:", score)
);

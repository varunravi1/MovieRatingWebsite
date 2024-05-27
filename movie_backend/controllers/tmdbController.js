const cheerio = require("cheerio");
const axios = require("axios");
const ScoreSchema = require("../models/scores");

const WEEK_EXPIRATION = 604800;
// const { search } = require("../routes/userRoutes");

// await client.connect();
const requestScroller = async (req, res) => {
  try {
    console.log("inside the scroller func");
    const data = await req.redisClient.get("new-release");
    if (data != null) {
      console.log("Cache Hit");
      //   console.log(JSON.parse(data));
      return res.json(JSON.parse(data));
    } else {
      const response = await axios.get(
        "https://api.themoviedb.org/3/movie/now_playing?language=en-US&api_key=8fa4fa6e422540365b21966c86cd2f9a"
      );
      console.log("API Hit in MovieScroller");
      res.json(response.data);
      //   console.log(JSON.stringify(response.data));
      //   console.log(response.data);
      req.redisClient.set("new-release", JSON.stringify(response.data), {
        EX: WEEK_EXPIRATION,
      });
      console.log(JSON.stringify(response.data));
    }
  } catch (error) {
    console.log("Something went wrong with api request");
    res.status(404).json({ error: "invalid request" });
  }
};
const searchRottenTomatoes = async (title, date) => {
  console.log("inside search rottentomatoes");
  const searchUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(
    title
  )}`;
  const year = date.split("-")[0];
  //   console.log(searchUrl);
  //   console.log(year);
  let resultTitle,
    resultYear = "";
  try {
    const { data } = await axios.get(searchUrl);
    console.log("in the try block of searchRottenTomatoes");
    const $ = cheerio.load(data);
    let found = false;
    let matchingHref = null;

    $("ul[slot='list'] search-page-media-row").each((index, element) => {
      console.log("Inside the then block");
      resultTitle = $(element).find('a[data-qa="info-name"]').text().trim();
      console.log("this is result title");
      console.log(resultTitle);
      resultYear = $(element).attr("releaseyear");

      console.log("This is result year");
      console.log(resultYear);
      if (
        resultTitle.toLowerCase() === title.toLowerCase() &&
        resultYear === year
      ) {
        console.log("checking if the date and name matches");
        matchingHref = $(element).find('a[data-qa="info-name"]').attr("href");
        matchingHref = matchingHref.split("/m/")[1];
        // matchingHref = matchingHref.replace(/_\d{4}$/, "");
        console.log(matchingHref);
        found = true;
        return false; // Break the loop
      }
    });
    if (!found) {
      console.log("No matching title and year found.");
      return null;
    } else {
      console.log("Returning href");
      return matchingHref;
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
};
const searchForScores = async (url, date) => {
  //   const year = date.split("-")[0];
  console.log("inside searchForScores");
  console.log(url);
  try {
    const website = `http://www.rottentomatoes.com/m/${url}`;
    const { data } = await axios.get(website);

    const $ = cheerio.load(data);

    const criticsScoreElement = $('rt-button[slot="criticsScore"] rt-text');
    const criticsScore = criticsScoreElement.text().trim();
    const audienceScoreElement = $('rt-button[slot="audienceScore"] rt-text');
    const audienceScore = audienceScoreElement.text().trim();
    console.log("these are the scores");
    console.log(criticsScore);
    console.log(audienceScore);
    const urlwithoutDate = url.replace(/_\d{4}$/, "");
    const score = await ScoreSchema.create({
      title: urlwithoutDate,
      date: date,
      criticScore: criticsScore,
      audienceScore: audienceScore,
    }).catch((error) => {
      console.log("error creating movie to store in db");
      console.log(error);
    });
    return {
      criticScore: criticsScore || "Not found",
      audienceScore: audienceScore || "Not found",
    };
  } catch (error) {
    return error;
  }
};
const countUnderscores = (str) => {
  return str.split("_").length - 1; // Subtract 1 to get the count of underscores
};
const scraper = async (req, res) => {
  const year = req.body.date.split("-")[0];
  //   console.log(req.body);
  console.log("In Scraper Function");
  //   console.log(req.redisClient);
  try {
    // console.log(`rt-audienceScore-${req.body.url}`);
    const scores = await req.redisClient.mGet([
      `rt-audienceScore-${req.body.url}`,
      `rt-criticScore-${req.body.url}`,
    ]);
    // console.log(scores);
    console.log("inside mget");
    if (scores[0] != null && scores[1] != null) {
      console.log("Scores Cache Hit");
      const audienceScore = JSON.parse(scores[0]);
      const criticScore = JSON.parse(scores[1]);
      return res.json({
        criticScore: criticScore,
        audienceScore: audienceScore,
      });
    } else {
      console.log("Scores Cache Missed");
      const check = await ScoreSchema.findOne({
        title: req.body.url,
        date: year,
      });
      if (check) {
        console.log("FOUND THE MOVIE IN DB");
        await req.redisClient.set(
          `rt-audienceScore-${req.body.url}`,
          JSON.stringify(check.audienceScore),
          {
            EX: WEEK_EXPIRATION,
          }
        );
        await req.redisClient.set(
          `rt-criticScore-${req.body.url}`,
          JSON.stringify(check.criticScore),
          {
            EX: WEEK_EXPIRATION,
          }
        );
        res.json({
          criticScore: check.criticScore,
          audienceScore: check.audienceScore,
        });
      } else {
        const underscores = countUnderscores(req.body.url);
        if (underscores > 3) {
          await delay(Math.random() * 2000);
          // console.log(req.body.url);
          searchForScores(req.body.url, year)
            .then(async (result) => {
              await req.redisClient.set(
                `rt-audienceScore-${req.body.url}`,
                JSON.stringify(result.audienceScore),
                {
                  EX: WEEK_EXPIRATION,
                }
              );
              await req.redisClient.set(
                `rt-criticScore-${req.body.url}`,
                JSON.stringify(result.criticScore),
                {
                  EX: WEEK_EXPIRATION,
                }
              );
              res.json({
                criticScore: result.criticScore,
                audienceScore: result.audienceScore,
              });
            })
            .catch((error) => {
              //   res.status(500).json({ err: error });
              res.json({ error: "unavailable on rotten tomatoes." });
            });
          // console.log(score);
        } else {
          await delay(Math.random() * 2000);
          const searchLink = await searchRottenTomatoes(req.body.title, year);
          console.log(searchLink);
          if (searchLink) {
            searchForScores(searchLink, year)
              .then(async (result) => {
                await req.redisClient.set(
                  `rt-audienceScore-${req.body.url}`,
                  JSON.stringify(result.audienceScore),
                  {
                    EX: WEEK_EXPIRATION,
                  }
                );
                await req.redisClient.set(
                  `rt-criticScore-${req.body.url}`,
                  JSON.stringify(result.criticScore),
                  {
                    EX: WEEK_EXPIRATION,
                  }
                );
                res.json({
                  criticScore: result.criticScore,
                  audienceScore: result.audienceScore,
                });
              })
              .catch((error) => {
                res.staus(500).json({ err: error });
              });
          } else {
            res.status(401).json({ err: "Not found" });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ error: "Error fetching data" });
  }
};
function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

module.exports = {
  requestScroller,
  scraper,
  delay,
};

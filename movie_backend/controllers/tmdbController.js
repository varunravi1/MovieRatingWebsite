const cheerio = require("cheerio");
const axios = require("axios");
const ScoreSchema = require("../models/scores");

const WEEK_EXPIRATION = 259200;
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
      console.log("cache missed");
      // const [response1, response2] = await Promise.all([
      //   axios.get(
      //     `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_release_type=3|4|6&release_date.gte=${new Date(
      //       "2024-03-01"
      //     )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&page=1`
      //   ),
      //   axios.get(
      //     `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_release_type=3|4|6&release_date.gte=${new Date(
      //       "2024-03-01"
      //     )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&page=2`
      //   ),
      // ]);
      // const combinedResults = [...response1.data, ...response2.data];
      const response1 = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_release_type=3|4|6&release_date.gte=${new Date(
          "2024-03-01"
        )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&page=1`
      );
      console.log("API Hit in MovieScroller");
      const response2 = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_release_type=3|4|6&release_date.gte=${new Date(
          "2024-03-01"
        )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&page=2`
      );
      const combinedResults = {
        ...response1.data, // This spreads the first response object properties
        results: [...response1.data.results, ...response2.data.results], // This specifically combines the results arrays
      };
      // console.log(combinedResults);
      // console.log("TYPE OF RESPONSE");
      // console.log(typeof response1.data);
      res.json(combinedResults);
      //   console.log(JSON.stringify(response.data));
      //   console.log(response.data);
      req.redisClient.set("new-release", JSON.stringify(combinedResults), {
        EX: WEEK_EXPIRATION,
      });
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
  console.log(searchUrl, year);
  console.log(year - 1);
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
        (resultTitle.toLowerCase() === title.toLowerCase() &&
          resultYear === year) ||
        (resultTitle.toLowerCase() === title.toLowerCase() &&
          resultYear === (year - 1).toString())
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
    // const score = await ScoreSchema.create({
    //   title: urlwithoutDate,
    //   date: date,
    //   criticScore: criticsScore,
    //   audienceScore: audienceScore,
    // }).catch((error) => {
    //   console.log("error creating movie to store in db");
    //   console.log(error);
    // });
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
      // if (check) {
      //   console.log("FOUND THE MOVIE IN DB");
      //   await req.redisClient.set(
      //     `rt-audienceScore-${req.body.url}`,
      //     JSON.stringify(check.audienceScore),
      //     {
      //       EX: WEEK_EXPIRATION,
      //     }
      //   );
      //   await req.redisClient.set(
      //     `rt-criticScore-${req.body.url}`,
      //     JSON.stringify(check.criticScore),
      //     {
      //       EX: WEEK_EXPIRATION,
      //     }
      //   );
      //   res.json({
      //     criticScore: check.criticScore,
      //     audienceScore: check.audienceScore,
      //   });
      // } else {
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
          .catch(async (error) => {
            await req.redisClient.set(
              `rt-audienceScore-${req.body.url}`,
              JSON.stringify("Not Available"),
              {
                EX: WEEK_EXPIRATION,
              }
            );
            await req.redisClient.set(
              `rt-criticScore-${req.body.url}`,
              JSON.stringify("Not Available"),
              {
                EX: WEEK_EXPIRATION,
              }
            );
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
      //}
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ error: "Error fetching data" });
  }
};
function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
const searchFunc = async (req, res) => {
  // console.log(req.body.signal);
  const searchQuery = req.body.search.replace(" ", "+");
  console.log("in the search func");
  try {
    const [responseMovie, responseShow] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          searchQuery
        )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
          searchQuery
        )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&language=en-US`
      ),
    ]);
    // console.log(responseShow.data);
    // const response = await axios.get(
    //   `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    //     searchQuery
    //   )}&api_key=8fa4fa6e422540365b21966c86cd2f9a&language=en-US`
    // );
    res.json({ movies: responseMovie.data, tv: responseShow.data });
    // console.log(response.data);
  } catch (error) {
    console.log("Failed to get data from api");
    console.error(error);
  }
};

module.exports = {
  requestScroller,
  scraper,
  delay,
  searchFunc,
};

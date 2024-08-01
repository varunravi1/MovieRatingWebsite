const cheerio = require("cheerio");
const axios = require("axios");
const ScoreSchema = require("../models/scores");
const streamingAvailability = require("streaming-availability");
const WEEK_EXPIRATION = 259200;
const DAY_EXPIRATION = 86400;
// const { search } = require("../routes/userRoutes");
const streamAPI = new streamingAvailability.Client(
  new streamingAvailability.Configuration({
    apiKey: process.env.STREAMING_AVAILABILITY,
  })
);
// await client.connect();
const requestScrollerMovie = async (req, res) => {
  try {
    console.log("inside the scroller func");
    const data = await req.redisClient.get("new-release");
    if (data != null) {
      console.log("Cache Hit");
      //   console.log(JSON.parse(data));
      return res.json(JSON.parse(data));
    } else {
      console.log("cache missed");
      const response1 = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?language=en-US&api_key=${process.env.TMDB_API}&page=1`
      );
      console.log("API Hit in MovieScroller");
      const response2 = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?language=en-US&api_key=${process.env.TMDB_API}&page=2`
      );
      const combinedResults = {
        ...response1.data, // This spreads the first response object properties
        results: [...response1.data.results, ...response2.data.results], // This specifically combines the results arrays
      };
      res.json(combinedResults);
      req.redisClient.set("new-release", JSON.stringify(combinedResults), {
        EX: WEEK_EXPIRATION,
      });
    }
  } catch (error) {
    console.log("Something went wrong with api request");
    res.status(404).json({ error: "invalid request" });
  }
};
const requestScrollerTV = async (req, res) => {
  try {
    console.log("Inside the TV scroller function");

    const data = await req.redisClient.get("on-air-tv");
    if (data != null) {
      console.log("Cache Hit");
      // console.log("These are the cached TV results:", JSON.parse(data));
      return res.json(JSON.parse(data));
    } else {
      console.log("Cache Missed");

      // console.log("Making first API call");
      const response1 = await axios.get(
        `https://api.themoviedb.org/3/tv/on_the_air?language=en-US&api_key=${process.env.TMDB_API}&page=1`
      );
      // console.log("First API call successful");

      // console.log("Making second API call");
      const response2 = await axios.get(
        `https://api.themoviedb.org/3/tv/on_the_air?language=en-US&api_key=${process.env.TMDB_API}&page=2`
      );
      // console.log("Second API call successful");

      const combinedResults = {
        ...response1.data,
        results: [...response1.data.results, ...response2.data.results],
      };
      // console.log("These are the combined TV results:", combinedResults);

      res.json(combinedResults);

      // console.log("Saving results to cache");
      await req.redisClient.set("on-air-tv", JSON.stringify(combinedResults), {
        EX: WEEK_EXPIRATION,
      });
      // console.log("Results saved to cache");
    }
  } catch (error) {
    console.error("Something went wrong with the API request", error);
    res
      .status(404)
      .json({ error: "Invalid request inside TV scroller function" });
  }
};
const logStringDetails = (str) => {
  console.log(`String: "${str}"`);
  for (let i = 0; i < str.length; i++) {
    console.log(`Character: "${str[i]}", ASCII: ${str.charCodeAt(i)}`);
  }
};
const searchRottenTomatoes = async (title, date) => {
  console.log("inside search rottentomatoes");

  const searchUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(
    title
  )}`;

  const year = date.split("-")[0];
  console.log(searchUrl, year);
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
      console.log(resultTitle.trim().toLowerCase());
      console.log("This is the movie we are looking for");
      console.log(title.trim().toLowerCase());
      console.log(
        resultTitle.trim().replace(/\s+/g, " ").toLowerCase() ==
          title.trim().replace(/\s+/g, " ").toLowerCase()
      );
      resultYear = $(element).attr("releaseyear");

      console.log("This is result year");
      console.log(resultYear);
      if (
        (resultTitle.trim().replace(/\s+/g, " ").toLowerCase() ===
          title.trim().replace(/\s+/g, " ").toLowerCase() &&
          resultYear === year) ||
        (resultTitle.toLowerCase() === title.toLowerCase() &&
          resultYear === (year - 1).toString())
      ) {
        console.log("checking if the date and name matches");
        matchingHref = $(element).find('a[data-qa="info-name"]').attr("href");
        matchingHref = matchingHref.split("/m/")[1];
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
  console.log("In Scraper Function");

  try {
    const scores = await req.redisClient.mGet([
      `rt-audienceScore-${req.body.url}`,
      `rt-criticScore-${req.body.url}`,
    ]);
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
      const underscores = countUnderscores(req.body.url);
      if (underscores > 3) {
        await delay(Math.random() * 2000);
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
            res.json({ error: "unavailable on rotten tomatoes." });
          });
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
              res.json({ error: "unavailable on rotten tomatoes." });
            });
        } else {
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
          res.json({ error: "unavailable on rotten tomatoes." });
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
const searchFunc = async (req, res) => {
  // console.log(req.body.signal);
  const searchQuery = req.body.search.replace(" ", "+");
  console.log("in the search func");
  try {
    const [responseMovie, responseShow] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          searchQuery
        )}&api_key=${process.env.TMDB_API}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
          searchQuery
        )}&api_key=${process.env.TMDB_API}&language=en-US`
      ),
    ]);
    res.json({ movies: responseMovie.data, tv: responseShow.data });
  } catch (error) {
    console.log("Failed to get data from api");
    console.error(error);
  }
};
const getMovies = async (req, res) => {
  pagenum = Number(req.body.page);
  genres = req.body.genres;
  console.log(genres);
  // console.log(req.body);
  let genreQuery = "";

  if (genres != null && genres.length > 0) {
    genreQuery = "&with_genres=" + genres.map(String).join("%2C");
  }
  console.log("This is genre query");
  console.log(genreQuery);
  const data = await req.redisClient.get(`movie+${pagenum}+${genreQuery}`);
  // console.log(data);
  if (data != null) {
    console.log("cache hit!!");
    res.json(JSON.parse(data));
  } else {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API}&page=${pagenum}${genreQuery}`
      );
      await req.redisClient.set(
        `movie+${pagenum}+${genreQuery}`,
        JSON.stringify(response.data),
        {
          EX: DAY_EXPIRATION,
        }
      );
      // console.log(response.data);
      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }
};

const getTV = async (req, res) => {
  pagenum = Number(req.body.page);
  genres = req.body.genres;
  console.log(genres);
  // console.log(req.body);
  let genreQuery = "";

  if (genres != null && genres.length > 0) {
    genreQuery = "&with_genres=" + genres.map(String).join("%2C");
  }
  console.log("This is genre query");
  console.log(genreQuery);
  const data = await req.redisClient.get(`tv+${pagenum}+${genreQuery}`);
  // console.log(data);
  if (data != null) {
    console.log("cache hit!!");
    res.json(JSON.parse(data));
  } else {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API}&page=${pagenum}${genreQuery}`
      );
      await req.redisClient.set(
        `tv+${pagenum}+${genreQuery}`,
        JSON.stringify(response.data),
        {
          EX: DAY_EXPIRATION,
        }
      );
      // console.log(response.data);
      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }
};
const getWatchProviders = async (req, res) => {
  const mediaType = req.body.mediaType;
  const id = req.body.id;
  console.log(req.body);
  const data = await req.redisClient.get(`watchProvider/${mediaType}/${id}`);
  if (data != null) {
    console.log("cache hit!");
    res.json(JSON.parse(data));
  } else {
    try {
      const data = await streamAPI.showsApi.getShow({
        id: `${mediaType.toLowerCase()}/${id}`,
        country: "us",
      });
      req.redisClient.set(
        `watchProvider/${mediaType}/${id}`,
        JSON.stringify(data.streamingOptions),
        {
          EX: WEEK_EXPIRATION,
        }
      );
      res.json(data.streamingOptions);
    } catch (error) {
      console.log(error);
      res.status(501).json("error");
    }
  }
};
const getMovieRatings = async (req, res) => {
  const id = req.body.id;
  const mediaType = req.body.mediaType;
  const data = await req.redisClient.get(`ratings/${mediaType}/${id}`);
  if (data != null) {
    console.log("cache hit inside movieRatings!");
    res.json(JSON.parse(data));
  } else {
    try {
      const result = await axios.get(
        `https://mdblist.com/api?apikey=${process.env.MDB_LIST}&tm=${id}&m=${
          mediaType.toLowerCase() === "tv" ? "show" : "movie"
        }`
      );
      req.redisClient.set(
        `ratings/${mediaType}/${id}`,
        JSON.stringify(result.data),
        {
          EX: WEEK_EXPIRATION,
        }
      );
      // console.log(result.data);
      res.json(result.data);
    } catch (error) {
      console.log(data);
      res.status(501).json("error");
    }
  }
};
const getActorInformation = async (req, res) => {
  const actorID = req.body.actorID;
  try {
    const result = await axios.get(
      `https://api.themoviedb.org/3/person/${actorID}?api_key=${process.env.TMDB_API}&append_to_response=tv_credits%2Cmovie_credits%2Cimages%2Cexternal_ids`
    );
    res.json(result.data);
  } catch (error) {
    console.log(error);
    res.status(501).json("error");
  }
};

module.exports = {
  requestScrollerMovie,
  requestScrollerTV,
  scraper,
  delay,
  searchFunc,
  getMovies,
  getTV,
  getWatchProviders,
  getMovieRatings,
  getActorInformation,
};

const axios = require("axios");
const cron = require("node-cron");
const MoviedleSchema = require("../models/moviedle");

function getRandomNumber(min = 1, max = 50) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomMovie(movieList) {
  const randomIndex = Math.floor(Math.random() * movieList.length);
  return movieList[randomIndex];
}

async function fetchMoviesWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url);
      const englishMovies = response.data.results.filter(
        (movie) => movie.original_language === "en" && movie.adult === false
      );
      if (englishMovies.length > 0) {
        console.log("Successfully found page the first time. ");
        return englishMovies;
      }
      console.log(
        `No English movies found on page ${url.split("page=")[1]}. Retrying...`
      );
    } catch (error) {
      console.error(`Error fetching movies (attempt ${i + 1}):`, error.message);
      if (i === maxRetries - 1) throw error;
    }
  }
  throw new Error("Failed to fetch English movies after multiple attempts");
}

async function updateDatabase(movieData) {
  try {
    await MoviedleSchema.deleteMany({});

    const currentDate = new Date().toISOString().split("T")[0];

    const moviesToInsert = movieData.map(({ category, movie }) => ({
      title: category,
      date: currentDate,
      media: movie,
    }));

    await MoviedleSchema.insertMany(moviesToInsert);
    console.log("Database updated successfully with new movies");
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
}
async function fetchMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&append_to_response=credits&api_key=${process.env.TMDB_API}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching movie details for ID ${movieId}:`,
      error.message
    );
    throw error;
  }
}
async function dailyTask() {
  console.log(
    "Running daily task at",
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  try {
    const [classic, millennium, modern] = await Promise.all([
      fetchMoviesWithRetry(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_original_language=en&release_date.gte=1985-01-01&release_date.lte=1999-12-31&api_key=${
          process.env.TMDB_API
        }&page=${getRandomNumber()}`
      ),
      fetchMoviesWithRetry(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_original_language=en&release_date.gte=2000-01-01&release_date.lte=2014-12-31&api_key=${
          process.env.TMDB_API
        }&page=${getRandomNumber()}`
      ),
      fetchMoviesWithRetry(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&with_original_language=en&release_date.gte=2015-01-01&api_key=${
          process.env.TMDB_API
        }&page=${getRandomNumber()}`
      ),
    ]);

    const classicId = getRandomMovie(classic).id;
    const millenniumId = getRandomMovie(millennium).id;
    const modernId = getRandomMovie(modern).id;

    const [classicMovie, millenniumMovie, modernMovie] = await Promise.all([
      fetchMovieDetails(classicId),
      fetchMovieDetails(millenniumId),
      fetchMovieDetails(modernId),
    ]);

    const selectedMovies = [
      { category: "classic", movie: classicMovie },
      { category: "millennium", movie: millenniumMovie },
      { category: "modern", movie: modernMovie },
    ];

    await updateDatabase(selectedMovies);

    selectedMovies.forEach(({ category, movie }) => {
      console.log(
        `${category.charAt(0).toUpperCase() + category.slice(1)} movie: ${
          movie.title
        }`
      );
    });

    return selectedMovies;
  } catch (error) {
    console.error("Error in daily task:", error);
    throw error;
  }
}

// Schedule the task to run at 12 AM EST every day
cron.schedule("0 0 * * *", dailyTask, {
  scheduled: true,
  timezone: "America/New_York",
});

console.log("Daily task scheduled");
const getMovieModern = async (req, res) => {
  try {
    const response = await MoviedleSchema.findOne({
      title: "modern",
    });
    res.json(response.media);
  } catch (error) {
    res.status(401).json("Failed");
  }

  //   console.log(response);
};
const getMovieMillennium = async (req, res) => {
  try {
    const response = await MoviedleSchema.findOne({
      title: "millennium",
    });
    res.json(response.media);
  } catch (error) {
    res.status(401).json("Failed");
  }

  //   console.log(response);
};
const getMovieClassic = async (req, res) => {
  try {
    const response = await MoviedleSchema.findOne({
      title: "classic",
    });
    res.json(response.media);
  } catch (error) {
    res.status(401).json("Failed");
  }

  //   console.log(response);
};
async function runDailyTaskOnce() {
  try {
    await dailyTask();
    console.log("Daily task completed successfully");
  } catch (error) {
    console.error("Error running daily task:", error);
  }
}

// Call this function to run the daily task once
// runDailyTaskOnce();
module.exports = {
  getMovieModern,
  getMovieClassic,
  getMovieMillennium,
};

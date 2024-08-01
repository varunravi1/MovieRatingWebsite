import React, { useEffect, useState } from "react";
import NavBarLoggedIn from "./NavBarLoggedIn";
import MoviedleSearch from "./MoviedleSearch";
import axios from "axios";
interface Genre {
  id: number;
  name: string;
}
interface Movie {
  created_by: any[];
  id: number;
  original_title: string;
  poster_path: string;
  backdrop_path: string;
  homepage: string;
  budget: number;
  revenue: number;
  tagline: string;
  original_name: string;
  overview: string;
  genres: Genre[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  credits: {
    cast: ActorInformation[];
    crew: any[];
  };
  director: string;
  trailer: any;
  first_air_date: string;
  last_air_date: string;
  audienceScore: string;
  criticScore: string;
  status: string;
}

interface ActorInformation {
  id: number;
  name: string;
}
interface Props {
  movie: Movie | null;
  selectedEra: string;
}
enum Era {
  "2015-2024" = "modern",
  "2000 - 2015" = "millennium",
  "1985 - 2000" = "classic",
}
function MoviedleGameScreen({ movie, selectedEra }: Props) {
  const [guessCount, setGuessCount] = useState<number>(0);
  const [guesses, setGuesses] = useState<Movie[]>([]);
  const [blurLevel, setBlurLevel] = useState<number>(1); // Start with 50px blur
  const [revealedActors, setRevealedActors] = useState<Set<number>>(new Set());
  const [revealedGenres, setRevealedGenres] = useState<Set<number>>(new Set());
  const [isDirectorRevealed, setIsDirectorRevealed] = useState<boolean>(false);
  const [bottomYear, setBottomYear] = useState(selectedEra.split("-")[0]);
  const [topYear, setTopYear] = useState(selectedEra.split("-")[1]);
  const [guessedYear, setGuessedYear] = useState<string | null>(null);
  const [winningScreen, setWinningScreen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const initialBlur = 30;
  const blurDecreaseRate = 3;
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
    const storageKey = `moviedle_${
      Era[selectedEra as keyof typeof Era]
    }_lastPlayed`;
    const lastPlayed = localStorage.getItem(storageKey);
    if (lastPlayed === today) {
      setGameOver(true);
      setWinningScreen(true);
    } else {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("moviedle_") && key.endsWith("_lastPlayed")) {
          const storedDate = localStorage.getItem(key);
          if (storedDate !== today) {
            localStorage.removeItem(key);
          }
        }
      });
    }
  }, [selectedEra]);
  const addGuess = async (guessedMovie: Movie) => {
    try {
      const result = await axios.post("/searchMedia", {
        type: "movie",
        id: guessedMovie.id,
      });
      const newGuess: Movie = result.data;
      newGuess.director = newGuess.credits.crew.find(
        (person) => person.job === "Director"
      ).name;
      console.log(newGuess.director);
      setGuesses((prevGuesses) => [...prevGuesses, newGuess]);
      setGuessCount((prevCount) => prevCount + 1);
      checkActorsAndGenres(newGuess);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  const checkActorsAndGenres = (recentGuess: Movie) => {
    if (!movie) return;
    if (recentGuess.id === movie.id) {
      setWinningScreen(true);
      localStorage.setItem(
        `moviedle_${Era[selectedEra as keyof typeof Era]}_lastPlayed`,
        new Date().toISOString().split("T")[0]
      );
      // localStorage.setItem("accessToken", response.data.accessToken);
      setBlurLevel(0);
    }
    if (guessCount == 10) {
      setWinningScreen(true);
      setBlurLevel(0);
    }
    const recentYear = recentGuess.release_date.split("-")[0];
    const movieYear = movie.release_date.split("-")[0];

    if (recentYear === movieYear) {
      setGuessedYear(recentYear);
    } else if (recentYear > movieYear) {
      setTopYear(recentYear < topYear ? recentYear : topYear);
    } else {
      setBottomYear(recentYear > bottomYear ? recentYear : bottomYear);
    }

    // Check actors
    recentGuess.credits.cast.forEach((actor) => {
      if (movie.credits.cast.some((a) => a.id === actor.id)) {
        setRevealedActors((prev) => new Set(prev).add(actor.id));
      }
    });

    // Check genres
    recentGuess.genres.forEach((genre) => {
      if (movie.genres.some((g) => g.id === genre.id)) {
        setRevealedGenres((prev) => new Set(prev).add(genre.id));
      }
    });

    // Check director
    if (recentGuess.director === movie.director) {
      setIsDirectorRevealed(true);
    }
  };

  useEffect(() => {
    setBlurLevel(Math.max(initialBlur - guessCount * blurDecreaseRate, 0));
  }, [guessCount]);

  const hideCharacters = (letters: string) => {
    return letters.replace(/[a-zA-Z]/g, "X");
  };
  const revealActors = (
    actors: ActorInformation[],
    count: number
  ): (ActorInformation | string)[] => {
    const totalActors = actors.length;
    const minHidden = 4;
    const maxReveal = Math.max(0, totalActors - minHidden);

    let revealCount = Math.min(count, maxReveal);
    revealCount = Math.min(revealCount, totalActors - minHidden);

    return actors.map((actor, index) => {
      if (index >= totalActors - revealCount || revealedActors.has(actor.id)) {
        return actor;
      } else {
        return hideCharacters(actor.name);
      }
    });
  };

  return (
    <>
      {movie && (
        <div className=" mukta-regular ">
          {!gameOver && (
            <div className="mb-2">
              <MoviedleSearch selectedEra={selectedEra} onClick={addGuess} />
            </div>
          )}
          <div className="flex w-full justify-center mb-5">
            <div className="flex min-h-20 w-full max-w-md flex-col bg-comp-black items-start rounded-2xl shadow-2xl relative">
              <div className="absolute top-0 right-0 py-2 px-3 bg-purp-light rounded-bl-xl rounded-tr-2xl">
                {guessCount} / 10
              </div>
              {guesses.length > 0 ? (
                <div className="flex flex-col justify-center items-start p-4">
                  {guesses.map((guessedMovie: Movie) => (
                    <div
                      key={guessedMovie.id}
                      className={`py-2 ${
                        guessedMovie.credits.cast.some((actor) =>
                          revealedActors.has(actor.id)
                        ) ||
                        guessedMovie.genres.some((genre) =>
                          revealedGenres.has(genre.id)
                        ) ||
                        (isDirectorRevealed &&
                          guessedMovie.director === movie.director)
                          ? "border-b-2 border-green-500"
                          : "border-b-2 border-red-500"
                      }`}
                    >
                      {`${guessedMovie.original_title} (${
                        guessedMovie.release_date.split("-")[0]
                      })`}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  Enter a guess!
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center mb-5">
            Tagline : {movie.tagline}
          </div>
          <div className="text-center mb-2"> Genres</div>

          <div className="flex justify-center space-x-10 mb-20 flex-wrap">
            {movie.genres.map((genre) => (
              <div
                key={genre.id}
                className={`rounded-full px-4 py-2 ${
                  revealedGenres.has(genre.id)
                    ? "bg-green-500"
                    : "px-4 bg-gray-800"
                }`}
              >
                {revealedGenres.has(genre.id) ? genre.name : "?"}
              </div>
            ))}
          </div>
          <div className="flex justify-center mb-20 space-x-20">
            <img
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
              className="w-56 max-h-[336px] flex-grow-0"
              style={{ filter: `blur(${blurLevel}px)` }}
            />
          </div>
          {guessedYear ? (
            <div className=" flex justify-center space-x-2 tracking-wide text-green-500">
              {guessedYear}
            </div>
          ) : (
            <div className=" flex justify-center space-x-2 tracking-wide">
              <div>{bottomYear}</div>
              <div>-</div>
              <div>{topYear}</div>
            </div>
          )}
          <div className="p-6 text-plat rounded-2xl shadow-lg space-y-4 flex flex-col items-center">
            <div className="w-full max-w-lg bg-comp-black p-4 rounded-2xl space-y-4">
              <div
                className={`${
                  isDirectorRevealed ? "text-green-500" : ""
                } text-lg`}
              >
                <span className="font-semibold">Director : </span>
                {isDirectorRevealed
                  ? movie.director
                  : hideCharacters(movie.director)}
              </div>

              <div className="text-xl font-bold">Cast</div>
              <div className="max-h-96 w-full overflow-auto custom-scrollbar space-y-2 border-t border-gray-700 pt-4">
                {revealActors(movie.credits.cast, guessCount).map(
                  (actor, index) => {
                    const totalActors = movie.credits.cast.length;
                    const minHidden = 5;
                    const maxReveal = Math.max(0, totalActors - minHidden);
                    const revealCount = Math.min(
                      guessCount,
                      maxReveal,
                      totalActors - minHidden
                    );

                    const isRevealedByTries =
                      index >= totalActors - revealCount;
                    const isRevealedByGuess =
                      typeof actor !== "string" && revealedActors.has(actor.id);

                    return (
                      <div
                        key={index}
                        className={`${
                          isRevealedByGuess
                            ? "bg-green-500 text-white"
                            : isRevealedByTries
                            ? "bg-yellow-200 text-black"
                            : ""
                        } py-2 px-4 hover:bg-gray-800 rounded-md transition duration-200 ease-in-out`}
                      >
                        {typeof actor === "string" ? actor : actor.name}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {winningScreen && (
        <div
          className={`bg-yt-black bg-opacity-90 fixed top-0 left-0 flex flex-col w-svw h-svh z-50 items-center justify-center space-y-4 mukta-regular ${
            winningScreen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>{movie?.original_title}</div>
          <img
            src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
            className="w-56 max-h-[336px] flex-grow-0 rounded-2xl"
          />
          <button
            onClick={() => setWinningScreen(false)}
            className="bg-purp hover:bg-purp-light text-plat font-bold py-2 px-4 rounded"
          >
            Play Again Tomorrow!
          </button>
        </div>
      )}
    </>
  );
}

export default MoviedleGameScreen;

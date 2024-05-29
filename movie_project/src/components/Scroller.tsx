import axios from "axios";
import { useEffect, useState } from "react";
import { PiBookmarkSimple } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { infinity } from "ldrs";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
}
infinity.register();
function Scroller() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scoresDict, setScoresDict] = useState<{ [key: string]: string }>({});
  const [movieData, setMovieData] = useState<any[]>([]);
  useEffect(() => {
    sendAPIReq();
  }, []);
  const sendAPIReq = async () => {
    try {
      const response = await axios.get("/homepage/scroller");
      console.log("back from scoller function");
      // console.log(response.data.results);
      // console.log(response.data.results);

      const movies = response.data.results.filter((movie: Movie) => {
        return (
          new Date(movie.release_date) > new Date("2023-12-01") &&
          movie.original_language === "en"
        );
      });
      // console.log(response.data.results);

      const movieTitles = movies.map((movie: Movie) => {
        return movie.original_title;
      });
      // console.log(movieTitles);
      setLoading(true);
      for (var i = 0; i < movieTitles.length; i++) {
        movieTitles[i] = movieTitles[i]
          .trim()
          .toLowerCase()
          .replace(/:/g, "")
          .replace(/-/g, "")
          .replace(/ /g, "_")
          .replace(/_+/g, "_"); // Replace multiple underscores with a single underscore;
      }

      console.log("Sending request to get scores");
      const scoresPromises = movies.map((movie: Movie, i: number) =>
        axios.post("/homepage/scores", {
          title: movie.original_title,
          url: movieTitles[i],
          date: movie.release_date,
        })
      );
      const scoresResults = await Promise.all(scoresPromises);
      const scoreDictTemp = scoresResults.reduce((dict, score, index) => {
        const bestScore =
          score.data.criticScore > score.data.audienceScore
            ? score.data.criticScore
            : score.data.audienceScore;
        dict[movies[index].original_title] = bestScore;
        return dict;
      }, {});

      // console.log(scoreDictTemp);
      setScoresDict(scoreDictTemp);
      setMovieData(movies);
      setLoading(false);
    } catch (error) {
      console.log("failed to get info");
      //   console.log(error);
    }
  };
  const handleClickBookmark = () => {};
  const handlePosterClick = (movie: Movie) => {
    navigate(`/${movie.original_title ? "movie" : "tv"}/${movie.id}`);
  };
  return (
    <>
      <h1 className="text-white bg-yt-black text-center roboto-bold text-4xl pt-8 tracking-[1px]">
        NEW RELEASES
      </h1>

      <div className="posters bg-yt-black py-14">
        {loading ? (
          <div className=" flex justify-center w-full ">
            <l-infinity color="white" size="70"></l-infinity>
          </div>
        ) : (
          <>
            <div className="scroller ">
              {movieData.map((movie) => (
                <div key={movie.id} className="movie-poster-container mr-10">
                  <img
                    onClick={() => {
                      handlePosterClick(movie);
                    }}
                    key={movie.id}
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    className="movie-poster pb-2 cursor-pointer"
                    // alt={`Poster for ${movie.title}`}
                  />
                  <div className="overlay-content ml-[100px] mt-40">
                    <img
                      src="public/Rotten_Tomatoes.png"
                      alt="Rotten Tomatoes"
                      className="rotten-tomatoes-logo mr-4"
                    />
                    <p className="rotten-tomatoes-score font-bold text-err-red">
                      {scoresDict[movie.original_title]
                        ? scoresDict[movie.original_title]
                        : "Not Available"}
                    </p>
                    <PiBookmarkSimple
                      onClick={handleClickBookmark}
                      className="size-9 absolute mt-56 bookmark-icon curso"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="scroller">
              {movieData.map((movie) => (
                <div key={movie.id} className="movie-poster-container mr-10">
                  <img
                    onClick={() => {
                      handlePosterClick(movie);
                    }}
                    key={movie.id}
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    className="movie-poster pb-2 cursor-pointer"
                    // alt={`Poster for ${movie.title}`}
                  />
                  <div className="overlay-content ml-[100px] mt-40">
                    <img
                      src="public/Rotten_Tomatoes.png"
                      alt="Rotten Tomatoes"
                      className="rotten-tomatoes-logo mr-4"
                    />
                    <p className="rotten-tomatoes-score font-bold text-err-red">
                      {scoresDict[movie.original_title]
                        ? scoresDict[movie.original_title]
                        : "Not Available"}
                    </p>
                    <PiBookmarkSimple
                      onClick={handleClickBookmark}
                      className="size-9 absolute mt-56 bookmark-icon curso"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* <PiBookmarkSimple className=""></PiBookmarkSimple> */}
    </>
  );
}

export default Scroller;

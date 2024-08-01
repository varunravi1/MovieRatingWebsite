import axios from "axios";
import { useEffect, useState, useContext, useRef } from "react";
import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { infinity } from "ldrs";
import { LoginContext } from "../userContext";
import BookMarkMiddleMan from "./BookMarkMiddleMan";
import PopUpLists from "./PopUpLists";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
  in_list: Boolean;
}
interface media {
  _id: string;
  mediaType: string;
  title: string;
  media: [];
}
interface Props {
  setLogin: React.Dispatch<React.SetStateAction<boolean>>;
  type: "movie" | "tv";
}
infinity.register();
function Scroller({ setLogin, type }: Props) {
  const { user, isAuthLoading } = useContext(LoginContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listScreen, setListScreen] = useState(false);
  const [scoresDict, setScoresDict] = useState<{ [key: string]: string }>({});
  const [movieData, setMovieData] = useState<any[]>([]);
  const mediaData = useRef<Movie | null>(null);
  useEffect(() => {
    console.log(isAuthLoading);
    if (!isAuthLoading) {
      sendAPIReq();
    }
  }, [isAuthLoading, user]);
  useEffect(() => {
    if (!isAuthLoading && user && !loading) {
      getLists();
    }
  }, [loading]);
  const getLists = async () => {
    try {
      console.log("in getLists");
      const results = await axios.post("/user/list", { user: user });
      const fetchedListData = results.data.listData;
      // setListData(fetchedListData);

      // Create a Set of movie IDs from all lists
      const movieIdsInLists = new Set<number>();
      fetchedListData.forEach((list: media) => {
        if (list.mediaType.toLowerCase() === type) {
          list.media.forEach((movie: Movie) => {
            movieIdsInLists.add(movie.id);
          });
        }
      });
      setMovieData((prevMovieData) =>
        prevMovieData.map((movie) => ({
          ...movie,
          in_list: movieIdsInLists.has(movie.id),
        }))
      );

      console.log("Updated movieData with in_list property");
    } catch (error) {
      console.log(error);
    }
  };

  const sendAPIReq = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/homepage/scroller/${type}`);
      console.log("back from scoller function");
      console.log(user);
      const movies = response.data.results;
      if (type === "movie") {
        console.log(movies.length);
        const movieTitles = movies.map((movie: Movie) => {
          return movie.original_title;
        });
        // console.log(movieTitles);

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

        setScoresDict(scoreDictTemp);
      }

      setMovieData(movies);
      setLoading(false);
    } catch (error) {
      console.log(error);
      console.log("failed to get info");
    }
  };
  const handleClickBookmark = async (movie: Movie) => {
    if (user) {
      console.log(movie.id);
      const movieIndex = movieData.findIndex((m) => m.id === movie.id);

      if (movieIndex !== -1) {
        // Movie found in movieData
        if (movieData[movieIndex].in_list) {
          // Movie is already in the list, navigate to MyList
          navigate("/MyList");
        } else {
          // Movie is not in the list, add it
          mediaData.current = movie;
          setListScreen(true);
        }
      } else {
        console.log("Movie not found in movieData");
      }
    } else {
      setLogin(true);
      console.log("User not logged in");
    }
  };
  const handlePosterClick = (movie: Movie) => {
    navigate(`/${movie.original_title ? "movie" : "tv"}/${movie.id}`);
  };
  const updateMovieInList = (movieId: number) => {
    setMovieData((prevMovieData) =>
      prevMovieData.map((movie) =>
        movie.id === movieId ? { ...movie, in_list: true } : movie
      )
    );
  };
  return (
    <>
      <div className="posters bg-yt-black py-14">
        {loading ? (
          <div className=" flex justify-center w-full ">
            <l-infinity color="white" size="70"></l-infinity>
          </div>
        ) : (
          <>
            <div className="scroller ">
              {movieData.map((movie, i) => (
                <div
                  key={movie.id}
                  className="movie-poster-container md:mr-6 lg:mr-10"
                >
                  <img
                    onClick={() => {
                      handlePosterClick(movie);
                    }}
                    key={movie.id}
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    className="movie-poster pb-2 cursor-pointer w-48 md:w-52 lg:w-56 flex-shrink-0"
                    // alt={`Poster for ${movie.title}`}
                  />

                  <div className="overlay-content ml-[90px] mt-32 md:ml-24 md:mt-36 lg:ml-[100px] lg:mt-40">
                    {type === "movie" && (
                      <>
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
                      </>
                    )}
                    {movie.in_list ? (
                      <PiBookmarkSimpleFill
                        className={`size-9 absolute ${
                          type === "movie" ? "mt-56" : "mt-0"
                        } bookmark-icon cursor-pointer`}
                        onClick={() => handleClickBookmark(movie)}
                      />
                    ) : (
                      <PiBookmarkSimple
                        className={`size-9 absolute ${
                          type === "movie" ? "mt-56" : "mt-0"
                        } bookmark-icon cursor-pointer`}
                        onClick={() => handleClickBookmark(movie)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="scroller">
              {movieData.map((movie, i) => (
                <div
                  key={movie.id}
                  className="movie-poster-container md:mr-6 lg:mr-10"
                >
                  <img
                    onClick={() => {
                      handlePosterClick(movie);
                    }}
                    key={movie.id}
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    className="movie-poster pb-2 cursor-pointer w-48 md:w-52 lg:w-56"
                    // alt={`Poster for ${movie.title}`}
                  />
                  <div className="overlay-content ml-[90px] mt-32 md:ml-24 md:mt-36 lg:ml-[100px] lg:mt-40">
                    {type === "movie" && (
                      <>
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
                      </>
                    )}
                    {movie.in_list ? (
                      <PiBookmarkSimpleFill
                        className="size-9 absolute mt-56 bookmark-icon cursor-pointer"
                        onClick={() => handleClickBookmark(movie)}
                      />
                    ) : (
                      <PiBookmarkSimple
                        className="size-9 absolute mt-56 bookmark-icon cursor-pointer"
                        onClick={() => handleClickBookmark(movie)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {listScreen && (
        <PopUpLists
          mediaData={mediaData}
          setListScreen={setListScreen}
          updateMovieInList={updateMovieInList}
          type={type}
        />
      )}
    </>
  );
}

export default Scroller;

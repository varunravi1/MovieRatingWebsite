import axios from "axios";
import { useEffect, useState, useContext, useRef } from "react";
import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { infinity } from "ldrs";
import { LoginContext } from "../userContext";
import BookMarkMiddleMan from "./BookMarkMiddleMan";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
}
interface media {
  _id: string;
  mediaType: string;
  title: string;
  media: [];
}
interface Props {
  setListScreen: (variable: boolean) => void;
  mediaData: React.MutableRefObject<Movie | null>;
  listScreen: boolean;
  setrerenderBookmark: (variable: boolean) => void;
  rerenderBookmark: boolean;
}
infinity.register();
function Scroller({
  listScreen,
  setListScreen,
  mediaData,
  rerenderBookmark,
  setrerenderBookmark,
}: Props) {
  const { user, isAuthLoading } = useContext(LoginContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scoresDict, setScoresDict] = useState<{ [key: string]: string }>({});
  const [movieData, setMovieData] = useState<any[]>([]);
  const [listData, setListData] = useState<any[]>([]);
  const bookmarkedLists = useRef<(0 | 1)[]>([]);
  const movieLists = useRef(new Set());
  // const movieLists = new Set();
  // const bookmarkedArray: (0 | 1)[] = [];
  // let bookmarkedLists: (0 | 1)[] | undefined;
  useEffect(() => {
    console.log(isAuthLoading);
    if (!isAuthLoading) {
      sendAPIReq();
    }
  }, [isAuthLoading]);

  // useEffect(() => {
  //   sendAPIReq();
  //   console.log("in the listscreen refresh useEffect");
  // }, [listScreen]);
  const sendAPIReq = async () => {
    setLoading(true);
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
      if (user) {
        const userLists = await axios.post("/user/list", { user: user });
        console.log(userLists);
        userLists.data.listData.forEach((list: media) => {
          if (list.mediaType === "Movie") {
            list.media.forEach((movie: Movie) => {
              movieLists.current.add(movie.id);
            });
          }
        });
      }
      console.log(movieLists.current);
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

      // console.log(scoreDictTemp);

      console.log("setting up the bookmark stuff");
      if (movieLists.current.size != 0) {
        for (let variable of movies) {
          // console.log("inside the loop");
          // console.log(bookmarkedLists.current);
          if (movieLists.current.has(variable.id)) {
            bookmarkedLists.current = [...bookmarkedLists.current, 1];
          } else {
            bookmarkedLists.current = [...bookmarkedLists.current, 0];
          }
        }
      }

      // console.log(bookmarkedArray);
      // setBookmarkedLists(bookmarkedArray);
      setScoresDict(scoreDictTemp);
      setMovieData(movies);
      setLoading(false);
      // setReRenderBookmark(true);
    } catch (error) {
      console.log(error);
      console.log("failed to get info");
      //   console.log(error);
    }
  };
  const handleClickBookmark = async (movie: Movie) => {
    console.log(movieLists.current);
    if (user) {
      console.log(movie.id);
      if (movieLists.current.has(movie.id)) {
        navigate("/MyList");
      } else {
        setListScreen(true);
        console.log(movie);
        mediaData.current = movie;
      }
    }
  };
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
              {movieData.map((movie, i) => (
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
                    {/* {bookmarkedLists[i] === 1 ? (
                      <PiBookmarkSimpleFill
                        onClick={() => {
                          handleClickBookmarkDelete(movie);
                        }}
                        className="size-9 absolute mt-56 bookmark-icon cursor-pointer"
                      />
                    ) : (
                      <PiBookmarkSimple
                        onClick={() => {
                          handleClickBookmark(movie);
                        }}
                        className="size-9 absolute mt-56 bookmark-icon cursor-pointer"
                      />
                    )} */}

                    <BookMarkMiddleMan
                      movie={movie}
                      rerenderBookmark={rerenderBookmark}
                      onClick={() => handleClickBookmark(movie)}
                      fill={bookmarkedLists.current[i]}
                      mediaData={mediaData}
                    ></BookMarkMiddleMan>
                  </div>
                </div>
              ))}
            </div>
            <div className="scroller">
              {movieData.map((movie, i) => (
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
                    {/* <PiBookmarkSimple
                      onClick={() => handleClickBookmark(movie)}
                      className="size-9 absolute mt-56 bookmark-icon curso"
                    /> */}
                    <BookMarkMiddleMan
                      fill={bookmarkedLists.current[i]}
                      mediaData={mediaData}
                    ></BookMarkMiddleMan>
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

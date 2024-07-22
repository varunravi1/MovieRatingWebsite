import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../SearchPage.css";
import NavBarLoggedIn from "./NavBarLoggedIn";
import { FaPlay } from "react-icons/fa6";
import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ImCancelCircle } from "react-icons/im";
import axios from "axios";
import { infinity } from "ldrs";
import Comments from "./Comments";
import PopUpLists2 from "./PopUpLists2";
import { Divider } from "@material-ui/core";
import { LoginContext } from "../userContext";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  backdrop_path: string;
  original_name: string;
  overview: string;
  genres: any[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  cast: any[];
  director: string;
  trailer: {
    key: string;
  };
  first_air_date: string;
  last_air_date: string;
  audienceScore: string;
  criticScore: string;
  status: string;
}
interface StreamingInfo {
  link: string;
  service: {
    name: string;
    imageSet: {
      darkThemeImage: string;
      lightThemeImage: string;
      whiteImage: string;
    };
  };
  type: string;
}
interface allRatings {
  source: string;
  value: string;
  score: string;
  votes: string;
}
interface Ratings {
  certification: string;
  ratings: allRatings[];
}
infinity.register();
function SearchPage() {
  const navigate = useNavigate();
  const [popupList, setPopUpList] = useState(false);
  const [bookmarkValue, setBookMarkValue] = useState(false);
  const { user } = useContext(LoginContext);
  const parameters = useParams();
  const mediaType = parameters.type;
  const id = parameters.id;
  const [movieData, setMovieData] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState(false);
  const [isMovie, setisMovie] = useState(true);
  const [streamingInfo, setStreamingInfo] = useState<StreamingInfo[]>([]);
  const [ratingList, setRatings] = useState<Ratings | null>(null);
  // const [scores, setScores] = useState("");
  useEffect(() => {
    getData();
    getWatchProviders();
    getRatings();
  }, []);
  const getWatchProviders = async () => {
    try {
      const result = await axios.post("/homepage/watchProvider", {
        mediaType: mediaType,
        id: id,
      });
      console.log(result.data);
      if (result.data.us == null) {
        setStreamingInfo([]);
      } else {
        setStreamingInfo(result.data.us);
      }
    } catch (error) {}
  };
  const getRatings = async () => {
    try {
      const result = await axios.post("/homepage/ratings", {
        mediaType: mediaType,
        id: id,
      });
      console.log(result.data);
      setRatings(result.data);
    } catch (error) {}
  };
  useEffect(() => {
    if (movieData) {
      getLists();
    }
  }, [movieData]);
  const getLists = async () => {
    try {
      const results = await axios.post("/user/list", { user: user });
      const listData = results.data.listData;

      for (var i = 0; i < listData.length; i++) {
        var list = listData[i].media;
        for (var j = 0; j < list.length; j++) {
          if (list[j].id === movieData?.id) {
            setBookMarkValue(true);
            return;
          }
        }
      }
    } catch (error) {}
  };

  const getData = async () => {
    const result = await axios.post("/searchMedia", {
      type: mediaType,
      id: id,
    });
    console.log(result.data);
    if (mediaType === "tv") {
      setisMovie(false);
    }

    const score =
      mediaType === "tv"
        ? {
            data: {
              audienceScore: "",
              criticScore: "",
            },
          }
        : await axios.post("/homepage/scores", {
            title: result.data.mediaData.original_title,
            url: result.data.mediaData.original_title
              .trim()
              .toLowerCase()
              .replace(/:/g, "")
              .replace(/-/g, "")
              .replace(/ /g, "_")
              .replace(/_+/g, "_"),
            date: result.data.mediaData.release_date,
          });

    setMovieData({
      ...result.data.mediaData,
      director: result.data.director ? result.data.director.name : "",
      cast: result.data.cast,
      trailer: result.data.trailer,
      audienceScore: score.data.audienceScore,
      criticScore: score.data.criticScore,
    });
  };
  const uniqueStreamingInfo: StreamingInfo[] = [];
  const addedServices = new Set();

  streamingInfo
    .filter((info) => info.type === "buy" || info.type === "subscription")
    .forEach((info) => {
      if (!addedServices.has(info.service.name)) {
        uniqueStreamingInfo.push(info);
        addedServices.add(info.service.name);
      }
    });

  return (
    <>
      {movieData ? (
        <div className="main-container">
          {trailer ? (
            <div className="overlay-container">
              <iframe
                width="420"
                height="315"
                className="snap-center fixed scale-150"
                src={`https://www.youtube-nocookie.com/embed/${movieData?.trailer.key}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-forms allow-presentation allow-same-origin allow-scripts"
              ></iframe>
              <ImCancelCircle
                onClick={() => {
                  setTrailer(false);
                }}
                className="absolute top-5 right-10 cursor-pointer bg-transparent border-none "
                size={30}
                color="#FFF"
              />
            </div>
          ) : (
            <></>
          )}

          <header className="header">
            <NavBarLoggedIn></NavBarLoggedIn>
          </header>
          <div className="content">
            <div
              className="bg-center bg-cover bg-no-repeat relative rounded-3xl "
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original/${movieData?.backdrop_path})`,
                backgroundRepeat: "no-repeat",
                height: "600px",
              }}
            >
              <h1 className=" absolute left-10 bottom-20 text-xl roboto-regular tracking-wider">
                {mediaType === "tv"
                  ? movieData?.original_name
                  : movieData?.original_title}{" "}
                ({movieData?.original_language})
              </h1>
              <div className="absolute left-10 bottom-14 text-sm flex space-x-4">
                <p key="adult">{ratingList?.certification}</p>
                <p key="runtime">
                  {mediaType === "tv" ? null : movieData?.runtime + "m"}
                </p>
                {movieData &&
                  movieData.genres.map((genre) => (
                    <p key={genre.id}>{genre.name}</p>
                  ))}
              </div>
              {
                <div className="absolute left-10 bottom-4 bg-yt-black rounded-3xl flex items-center pl-2 buttons">
                  <FaPlay />
                  <button
                    className="px-3 py-1 roboto-regular tracking-wide "
                    onClick={() => {
                      setTrailer(true);
                    }}
                  >
                    Trailer
                  </button>
                </div>
              }
              {!bookmarkValue ? (
                <PiBookmarkSimple
                  onClick={() => setPopUpList(true)}
                  size={40}
                  className="absolute top-4 right-4 cursor-pointer transition-all hover:scale-125"
                ></PiBookmarkSimple>
              ) : (
                <PiBookmarkSimpleFill
                  onClick={() => navigate("/MyList")}
                  size={40}
                  className="absolute top-4 right-4 cursor-pointer transition-all hover:scale-125"
                ></PiBookmarkSimpleFill>
              )}
            </div>
            <hr className="my-5 border-gray-400"></hr>
            <div className="flex space-x-4 pb-6">
              <div className="flex-none">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movieData?.poster_path}`}
                  className="w-36 h-auto rounded-xl"
                  alt="Poster"
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center">
                  <p className="roboto-bold text-lg pb-2 tracking-wide ">
                    {mediaType === "tv"
                      ? movieData &&
                        movieData?.first_air_date.split("-")[0] +
                          " - " +
                          (movieData?.status === "Ended"
                            ? movieData?.last_air_date.split("-")[0]
                            : "Present")
                      : movieData?.release_date.split("-")[0] +
                        " | " +
                        movieData?.director}
                  </p>
                </div>
                <p className="roboto-regular mb-6">{movieData?.overview}</p>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                      <img
                        src="../public/Rotten_Tomatoes.png"
                        alt="Rotten Tomatoes"
                        className="w-12"
                      />
                      {ratingList?.ratings
                        .filter((rating) => rating.source === "tomatoes")
                        .map((rating, index) => (
                          <p key={index} className="roboto-bold text-red-400">
                            {rating.value === null
                              ? "Not Found"
                              : rating.value + "%"}
                          </p>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      <img
                        src="../public/IMDb-Logo.png"
                        alt="IMDb"
                        className="w-12"
                      />
                      {ratingList?.ratings
                        .filter((rating) => rating.source === "imdb")
                        .map((rating, index) => (
                          <p
                            key={index}
                            className="roboto-bold text-yellow-500"
                          >
                            {rating.value + "/10"}
                          </p>
                        ))}
                    </div>
                  </div>
                  <div className="flex overflow-auto space-x-4">
                    {uniqueStreamingInfo.length > 0 &&
                      uniqueStreamingInfo.map((info, index) => (
                        <div
                          key={index}
                          className="hover:bg-very-light-black rounded-full cursor-pointer h-20 w-20 flex items-center justify-center"
                          onClick={() => {
                            window.open(info.link, "_blank");
                          }}
                        >
                          <img
                            src={info.service.imageSet.darkThemeImage}
                            className="max-w-full max-h-full object-contain p-2"
                            alt={info.service.name}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="where-to-watch"></div>
              <div className="roboto-bold mb-3">Cast</div>
              <div className="flex max-w-full max-h-80 overflow-x-auto whitespace-nowrap rounded-3xl justify-between">
                {movieData &&
                  movieData.cast.map((cast) => (
                    <>
                      <div className="px-4 py-3 w-44 flex-shrink-0">
                        <img
                          src={`https://image.tmdb.org/t/p/w500/${cast.profile_path}`}
                          alt="../public/depositphotos_133352010-stock-illustration-default-placeholder-man-and-woman.jpg"
                          className="rounded-xl mb-2"
                        ></img>
                        <h1
                          className="roboto-regular text-base"
                          key={cast.cast_id}
                        >
                          {cast.name}
                        </h1>
                        <p className="roboto-light text-xs">{cast.character}</p>
                      </div>
                    </>
                  ))}
              </div>
            </div>
            <Comments movie={movieData}></Comments>
          </div>
          {popupList && user && (
            <div>
              <PopUpLists2
                tvormov={movieData}
                setPopUpLists={setPopUpList}
                setBookMarkValue={setBookMarkValue}
              />
            </div>
          )}
          <footer className="footer">© 2024 Your Site Name</footer>
        </div>
      ) : (
        <div className="fixed top-0 left-0  w-svw h-svh flex items-center justify-center">
          <l-infinity color="white" size="70"></l-infinity>
        </div>
      )}
    </>
  );
}
export default SearchPage;

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../SearchPage.css";
import NavBarLoggedIn from "./NavBarLoggedIn";
import { FaPlay } from "react-icons/fa6";
import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
import { ImCancelCircle } from "react-icons/im";
import axios from "axios";
import { infinity } from "ldrs";
import Comments from "./Comments";
import PopUpLists2 from "./PopUpLists2";
import { LoginContext } from "../userContext";
import ImageCarousel from "./ImageCarousel";
import FlipLogin from "./FlipLogin";
import { MdMovieFilter } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";

interface backDrop {
  aspect_ratio: number;
  height: number;
  width: number;
  file_path: string;
}
interface ProductionCompany {
  id: number;
  logo_path: string;
  name: string;
}
interface Video {
  id: string;
  name: string;
  type: string;
}
interface Keywords {
  id: number;
  name: string;
}
interface Movie {
  keywords: {
    keywords: Keywords[];
  };
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
  genres: any[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  credits: {
    cast: any[];
    crew: any[];
  };
  images: {
    backdrops: backDrop[];
  };
  production_companies: ProductionCompany[];
  director: string;
  videos: {
    results: Video[];
  };
  trailer: any;
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
interface RefObject {
  [key: string]: HTMLDivElement | null;
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
  // const [isMovie, setisMovie] = useState(true);
  const [streamingInfo, setStreamingInfo] = useState<StreamingInfo[]>([]);
  const [ratingList, setRatings] = useState<Ratings | null>(null);
  const [logIn, setLogIn] = useState(false);

  // const [scores, setScores] = useState("");
  useEffect(() => {
    getData();
    getWatchProviders();
    getRatings();
  }, []);
  const handleBookMark = () => {
    if (user) {
      setPopUpList(true);
    } else {
      setLogIn(true);
    }
  };
  const getWatchProviders = async () => {
    try {
      const result = await axios.post("/homepage/watchProvider", {
        mediaType: mediaType,
        id: id,
      });
      // console.log(result.data);
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
    // if (mediaType === "tv") {
    //   setisMovie(false);
    // }

    const score =
      mediaType === "tv"
        ? {
            data: {
              audienceScore: "",
              criticScore: "",
            },
          }
        : await axios.post("/homepage/scores", {
            title: result.data.original_title,
            url: result.data.original_title
              .trim()
              .toLowerCase()
              .replace(/:/g, "")
              .replace(/-/g, "")
              .replace(/ /g, "_")
              .replace(/_+/g, "_"),
            date: result.data.release_date,
          });
    const tempData: Movie = result.data;
    tempData.audienceScore = score.data.audienceScore;
    tempData.criticScore = score.data.criticScore;
    tempData.trailer = tempData.videos.results.find(
      (trailer: Video) => trailer.type === "Trailer"
    );
    const director = tempData.credits.crew.find(
      (person) => person.job === "Director"
    );
    tempData.director = director ? director.name : "";
    setMovieData(tempData);
  };
  const uniqueStreamingInfo: StreamingInfo[] = [];
  const addedServices = new Set();

  streamingInfo
    .filter(
      (info) =>
        info.type === "buy" ||
        info.type === "subscription" ||
        info.type === "rent"
    )
    .forEach((info) => {
      if (!addedServices.has(info.service.name)) {
        uniqueStreamingInfo.push(info);
        addedServices.add(info.service.name);
      }
    });
  const scrollPos = useRef<RefObject>({});
  return (
    <>
      {movieData ? (
        <div className="main-container overflow-hidden">
          {trailer ? (
            <div className="overlay-container">
              <iframe
                // width="420"
                // height="315"
                className="snap-center fixed scale-150 w-[250px] h-[200px] lg:w-[420px] lg:h-[315px]"
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
              className="bg-center bg-cover bg-no-repeat relative rounded-3xl h-[350px] md:h-[450px] lg:h-[600px]"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original/${movieData?.backdrop_path})`,
              }}
            >
              <h1 className=" absolute left-5 bottom-20 md:left-8 lg:left-10 text-base md:text-lg lg:text-xl roboto-regular tracking-wider ">
                {mediaType === "tv"
                  ? movieData?.original_name
                  : movieData?.original_title}{" "}
                ({movieData?.original_language})
              </h1>
              <div className="absolute left-5 md:left-8 lg:left-10 bottom-14 text-xs md:text-sm flex space-x-4">
                {ratingList?.certification && (
                  <p key="adult">{ratingList?.certification}</p>
                )}

                {mediaType === "movie" && (
                  <p key="runtime">{movieData?.runtime + "m"}</p>
                )}

                {movieData &&
                  movieData.genres.map((genre, index) => (
                    <p key={genre.id}>{index <= 2 && genre.name}</p>
                  ))}
              </div>
              {
                <div className="absolute left-5 md:left-8 lg:left-10 bottom-4 bg-yt-black rounded-3xl flex items-center pl-2 buttons">
                  <FaPlay />
                  <button
                    className="px-3 py-1 roboto-regular tracking-wide text-xs md:text-sm lg:text-base"
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
                  onClick={handleBookMark}
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
                  className="w-36 md:w-48 lg:w-52 h-auto rounded-xl"
                  alt="Poster"
                />
              </div>
              <div className="">
                <div className="hidden md:flex text-xs md:text-base items-center roboto-bold space-x-4 pb-2">
                  <p className="tracking-wide">
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
                  {mediaType === "tv" &&
                    movieData?.created_by.map((director, index) => (
                      <>
                        <p> | </p>
                        <p>{index <= 2 && director.name}</p>
                      </>
                    ))}
                </div>
                <div className="block md:hidden text-xs md:text-base items-center roboto-bold pb-2 tracking-wide text-start">
                  <p className="pb-1">
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
                  {mediaType === "tv" &&
                    movieData?.created_by.map((director, index) => (
                      <>
                        <p className="pb-1">{index <= 2 && director.name}</p>
                      </>
                    ))}
                </div>
                <p className="roboto-regular mb-6 text-sm lg:text-base tracking-wide md:tracking-normal lg:tracking-normal">
                  {movieData?.overview}
                </p>
                <div className="hidden lg:flex items-center justify-between w-full">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                      <img
                        src="../public/Rotten_Tomatoes.png"
                        alt="Rotten Tomatoes"
                        className="w-12"
                      />
                      {ratingList?.ratings != null ? (
                        ratingList?.ratings
                          ?.filter((rating) => rating.source === "tomatoes")
                          .map((rating, index) => (
                            <p key={index} className="roboto-bold text-red-400">
                              {rating.value === null
                                ? "Not Found"
                                : rating.value + "%"}
                            </p>
                          ))
                      ) : (
                        <p className="roboto-bold text-red-400">
                          {movieData?.criticScore}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <img
                        src="../public/Rotten_Tomatoes_audience.png"
                        alt="Rotten Tomatoes"
                        className="w-12"
                      />
                      {ratingList?.ratings != null ? (
                        ratingList?.ratings
                          .filter(
                            (rating) => rating.source === "tomatoesaudience"
                          )
                          .map((rating, index) => (
                            <p key={index} className="roboto-bold text-red-400">
                              {rating.value === null
                                ? "Not Found"
                                : rating.value + "%"}
                            </p>
                          ))
                      ) : (
                        <p className="roboto-bold text-red-400">
                          {movieData?.audienceScore}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <img
                        src="../public/IMDb-Logo.png"
                        alt="IMDb"
                        className="w-12"
                      />
                      {ratingList?.ratings != null ? (
                        ratingList?.ratings
                          ?.filter((rating) => rating.source === "imdb")
                          .map((rating, index) => (
                            <p
                              key={index}
                              className="roboto-bold text-yellow-500"
                            >
                              {rating.value + "/10"}
                            </p>
                          ))
                      ) : (
                        <p className="roboto-bold text-yellow-500">Not Found</p>
                      )}
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
            <div className="flex text-sm lg:hidden items-center justify-between w-full mb-6">
              <div className="flex items-center space-x-8 justify-center w-full">
                <div className="flex items-center space-x-4">
                  <img
                    src="../public/Rotten_Tomatoes.png"
                    alt="Rotten Tomatoes"
                    className="w-10"
                  />
                  {ratingList?.ratings != null ? (
                    ratingList?.ratings
                      ?.filter((rating) => rating.source === "tomatoes")
                      .map((rating, index) => (
                        <p key={index} className="roboto-bold text-red-400">
                          {rating.value === null
                            ? "Not Found"
                            : rating.value + "%"}
                        </p>
                      ))
                  ) : (
                    <p className="roboto-bold text-red-400">
                      {movieData?.criticScore}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <img
                    src="../public/Rotten_Tomatoes_audience.png"
                    alt="Rotten Tomatoes"
                    className="w-10"
                  />
                  {ratingList?.ratings != null ? (
                    ratingList?.ratings
                      .filter((rating) => rating.source === "tomatoesaudience")
                      .map((rating, index) => (
                        <p key={index} className="roboto-bold text-red-400">
                          {rating.value === null
                            ? "Not Found"
                            : rating.value + "%"}
                        </p>
                      ))
                  ) : (
                    <p className="roboto-bold text-red-400">
                      {movieData?.audienceScore}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <img
                    src="../public/IMDb-Logo.png"
                    alt="IMDb"
                    className="w-10"
                  />
                  {ratingList?.ratings != null ? (
                    ratingList?.ratings
                      ?.filter((rating) => rating.source === "imdb")
                      .map((rating, index) => (
                        <p key={index} className="roboto-bold text-yellow-500">
                          {rating.value + "/10"}
                        </p>
                      ))
                  ) : (
                    <p className="roboto-bold text-yellow-500">Not Found</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex lg:hidden mb-6">
              <div className="flex overflow-auto space-x-4 justify-center items-center w-full">
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

            <div className="roboto-bold md:text-lg lg:text-xl">Cast</div>
            <ImageCarousel
              type="cast"
              scrollPos={scrollPos}
              data={movieData?.credits.cast}
            />
            <div className="roboto-bold mb-8 md:text-lg lg:text-xl">Images</div>
            <ImageCarousel
              type="backdrop"
              scrollPos={scrollPos}
              data={movieData?.images?.backdrops}
            />
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
          {logIn && (
            <div className=" bg-yt-black bg-opacity-70 fixed top-0 left-0 flex w-svw h-svh z-50">
              <FlipLogin></FlipLogin>
              <ImCancelCircle
                onClick={() => {
                  setLogIn(false);
                }}
                className="absolute top-5 right-10 cursor-pointer bg-transparent border-none "
                size={30}
                color="#FFF"
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

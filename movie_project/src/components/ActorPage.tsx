import React, { useEffect, useState } from "react";
import NavBarLoggedIn from "./NavBarLoggedIn";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
interface MovieorShow {
  character: string;
  first_air_date: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_name: string;
  id: string;
  popularity: number;
  episode_count: number;
  name: string;
}
interface Crew {
  department: string;
  job: string;
  original_title: string;
  poster_path: string;
  release_date: string;
  id: string;
}
enum MovieGenres {
  "Action" = 28,
  "Adventure" = 12,
  "Animation" = 16,
  "Comedy" = 35,
  "Crime" = 80,
  "Documentary" = 99,
  "Drama" = 18,
  "Family" = 10751,
  "Fantasy" = 14,
  "History" = 36,
  "Horror" = 27,
  "Music" = 10402,
  "Mystery" = 9648,
  "Romance" = 10749,
  "Science Fiction" = 878,
  "TV Movie" = 10770,
  "Thriller" = 53,
  "War" = 10752,
  "Western" = 37,
}

enum TVGenres {
  "Action & Adventure" = 10759,
  "Animation" = 16,
  "Comedy" = 35,
  "Crime" = 80,
  "Documentary" = 99,
  "Drama" = 18,
  "Family" = 10751,
  "Kids" = 10762,

  "Mystery" = 9648,
  "News" = 10763,
  "Reality" = 10764,
  "Sci-Fi & Fantasy" = 10765,
  "Soap" = 10766,
  "Talk" = 10767,
  "War and Politics" = 10768,
  "Western" = 37,
}

interface ActorInformation {
  allMedia: MovieorShow[];

  name: string;
  biography: string;
  birthday: string;
  deathday: null;
  place_of_birth: string;
  profile_path: string;
  movie_credits: {
    cast: MovieorShow[];
    crew: Crew[];
  };
  tv_credits: {
    cast: MovieorShow[];
    crew: Crew[];
  };
  known_for: MovieorShow[];
}
function ActorPage() {
  const parameters = useParams();
  const navigate = useNavigate();
  const actorID = parameters.id;
  const [actorInformation, setActorInformation] = useState<ActorInformation>();
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const truncateLength = 650;

  const shouldTruncate =
    actorInformation?.biography == null
      ? false
      : actorInformation?.biography.length > truncateLength;
  useEffect(() => {
    getActorInformation();
  }, []);
  const getActorInformation = async () => {
    try {
      const response = await axios.post("/homepage/actor", {
        actorID: actorID,
      });
      console.log(response.data);
      const actorInfo: ActorInformation = response.data;
      const tempArray = [
        ...actorInfo.movie_credits.cast,
        ...actorInfo.tv_credits.cast,
      ];
      actorInfo.allMedia = tempArray;
      actorInfo.allMedia = actorInfo.allMedia
        .filter((movie: MovieorShow) => {
          return (
            movie.character.length != 0 &&
            !movie.character.includes("Self") &&
            !movie.character.includes("uncredited") &&
            !movie.character.includes("archive")
          );
        })
        .sort((a: MovieorShow, b: MovieorShow) => {
          const dateA = a.release_date ? a.release_date : a.first_air_date;
          const dateB = b.release_date ? b.release_date : b.first_air_date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      const filteredArray = tempArray
        .filter((movie: MovieorShow) => {
          return (
            movie.character.length != 0 &&
            !movie.character.includes("Self") &&
            !movie.character.includes("uncredited") &&
            !movie.character.includes("archive") &&
            (movie.episode_count == null || movie.episode_count > 10)
          );
        })
        .sort((a, b) => b.popularity - a.popularity);
      actorInfo.known_for = filteredArray.filter(
        (_movie: MovieorShow, index) => {
          return index < 4;
        }
      );
      setActorInformation(actorInfo);
    } catch (error) {}
  };
  return (
    <>
      <div className="main-container shadow-lg min-h-svh">
        <NavBarLoggedIn />
        <div className="mt-10 ml-10">
          <p className="roboto-bold tracking-wide text-3xl mb-6">
            {actorInformation?.name}
          </p>
          <div className="flex">
            <img
              src={`https://image.tmdb.org/t/p/w500/${actorInformation?.profile_path}`}
              className="w-60 h-[360px] rounded-2xl flex-none"
            />
            <div className="flex-grow ml-4">
              <p className="roboto-regular text-lg">
                {isExpanded
                  ? actorInformation?.biography
                  : actorInformation?.biography.substring(0, truncateLength)}
              </p>
              {shouldTruncate && (
                <button
                  onClick={toggleExpand}
                  className="text-blue-500 underline mt-2"
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 roboto-regular">
            {actorInformation?.birthday &&
              "Age: " +
                (
                  new Date().getFullYear() -
                  new Date(actorInformation?.birthday).getFullYear()
                )
                  .toString()
                  .substring(0, 4)}
          </p>
          <p className="mt-4 roboto-regular">
            {actorInformation?.birthday &&
              "Date of Birth: " + actorInformation.birthday}
          </p>
          <p className="mt-4 roboto-regular">
            {actorInformation?.place_of_birth &&
              "Birthplace: " + actorInformation.place_of_birth}
          </p>
          <div className="mt-10">
            <p className="roboto-bold tracking-wide text-3xl mb-6">Popular</p>
            <div className="flex flex-wrap">
              {actorInformation?.known_for.map((movie: MovieorShow) => (
                <div
                  key={movie.id}
                  className="flex w-1/2 mb-6 cursor-pointer hover:bg-comp-black rounded-2xl"
                  onClick={() => {
                    movie.original_title
                      ? navigate(`/movie/${movie.id}`)
                      : navigate(`/tv/${movie.id}`);
                  }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
                    alt=""
                    className="w-24 rounded-2xl"
                  />
                  <div className="ml-6 roboto-regular mt-6">
                    <p className="mb-2">
                      {movie.original_title
                        ? movie.original_title
                        : movie.original_name}
                    </p>
                    <p className="text-sm italic mb-2">{movie.character}</p>
                    <div className="flex space-x-3 roboto-regular text-sm italic">
                      {movie.genre_ids.map((genre: number) => (
                        <p key={genre}>
                          {movie.original_title
                            ? MovieGenres[genre]
                            : TVGenres[genre]}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="roboto-bold tracking-wide text-3xl mb-6">
              All Movies/Shows
            </p>
            <div className="flex flex-wrap">
              {actorInformation?.allMedia.map((movie: MovieorShow) => (
                <div
                  key={movie.id}
                  className="flex w-1/2 mb-6 cursor-pointer hover:bg-comp-black rounded-2xl"
                  onClick={() => {
                    movie.original_title
                      ? navigate(`/movie/${movie.id}`)
                      : navigate(`/tv/${movie.id}`);
                  }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
                    alt=""
                    className="w-24 rounded-2xl"
                  />
                  <div className="ml-6 roboto-regular mt-6">
                    <p className="mb-2">
                      {movie.original_title
                        ? movie.original_title
                        : movie.original_name}
                    </p>
                    <p className="text-sm italic mb-2">{movie.character}</p>
                    <div className="flex space-x-3 roboto-regular text-sm italic">
                      {movie.genre_ids.map((genre: number) => (
                        <p key={genre}>
                          {movie.original_title
                            ? MovieGenres[genre]
                            : TVGenres[genre]}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="footer"></div>
    </>
  );
}

export default ActorPage;

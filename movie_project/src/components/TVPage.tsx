import React, { useEffect, useRef, useState } from "react";
import NavBarLoggedIn from "./NavBarLoggedIn";
import SearchBar from "./SearchBar";
import axios from "axios";
import SideBarMedia from "./SideBarMedia";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
  genre_ids: number[];
}
interface Props {
  selectedTVGenres: number[];
  // setSelectedMovieGenres: React.Dispatch<React.SetStateAction<number[]>>;
}
enum TVGenres {
  "Action & Adventure" = 10759,
  "Animation" = 16,
  "Comedy" = 35,
  "Crime" = 80,
  "Documentary" = 99,
  "Drama" = 18,
  "Mystery" = 9648,
  "Reality" = 10764,
  "Sci-Fi & Fantasy" = 10765,
  "Soap" = 10766,
  "Talk" = 10767,
}
function TVPage({ selectedTVGenres }: Props) {
  const [movieData, setMovieData] = useState<Movie[]>([]);
  // const [MovieOrTV, setMovieorTV] = useState("Movie");
  const navigate = useNavigate();
  useEffect(() => {
    getMovies(selectedTVGenres);
  }, []);

  const page = useRef(1);
  const loadashDebounce = useRef<_.DebouncedFunc<(genres: Number[]) => void>>(
    _.debounce((genres) => {
      getMovies(genres);
    }, 500)
  );
  useEffect(() => {
    page.current = 1;
    loadashDebounce.current(selectedTVGenres);
    return () => {
      loadashDebounce.current.cancel();
    };
  }, [selectedTVGenres]);
  const getMovies = async (genres: Number[]) => {
    try {
      console.log(page.current);
      const response = await axios.post("/homepage/tv", {
        page: page.current,
        genres: genres,
      });
      console.log(response.data.results);
      setMovieData((prevMovieData) => {
        const newMovies = response.data.results.filter(
          (newMovie: Movie) =>
            !prevMovieData.some((movie) => movie.id === newMovie.id)
        );
        return page.current == 1 ? newMovies : [...prevMovieData, ...newMovies];
      });
    } catch (error) {}
  };
  const handleNextPage = () => {
    page.current += 1;
    getMovies(selectedTVGenres);
  };
  return (
    <>
      <div className="flex flex-wrap ml-12">
        {movieData
          ?.filter((movie: Movie) =>
            selectedTVGenres.length === 0
              ? true
              : selectedTVGenres.every((genreId: number) =>
                  movie.genre_ids.includes(genreId)
                )
          )
          .map((movie: Movie) => (
            <div
              className="mt-4 p-2 hover:bg-black-hover cursor-pointer rounded-2xl"
              onClick={() => {
                navigate(
                  `/${movie.original_title ? "movie" : "tv"}/${movie.id}`
                );
              }}
              key={movie.id}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                alt={movie.original_title}
                className="max-w-56 rounded-2xl"
              />
            </div>
          ))}
        <div className="flex justify-center items-center w-full mt-4 ">
          <div
            className="bg-very-light-black p-3 rounded-2xl cursor-pointer"
            onClick={handleNextPage}
          >
            See More
          </div>
        </div>
      </div>
    </>
  );
}

export default TVPage;

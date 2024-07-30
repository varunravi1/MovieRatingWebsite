import React, { useContext } from "react";
import NavBarLoggedIn from "./NavBarLoggedIn";
import SearchBar from "./SearchBar";
import { SearchContext } from "../SearchContext";
import { useNavigate } from "react-router-dom";
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
interface Movie {
  genre_ids: any[];
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
function SearchResults() {
  const { searchResults } = useContext(SearchContext);
  console.log(searchResults);
  const navigate = useNavigate();
  return (
    <div className="main-container min-h-screen shadow-lg">
      <NavBarLoggedIn />
      <div className="mt-8">
        <SearchBar enableDropDown={false} />
      </div>
      <div>
        {searchResults.length != 0 ? (
          searchResults.map((movie: Movie) => (
            <div
              className=" ml-6 my-10 flex space-x-4 items-center justify-start hover:bg-comp-black rounded-2xl"
              onClick={() =>
                navigate(
                  `/${movie.original_title ? "movie" : "tv"}/${movie.id}`
                )
              }
            >
              <img
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                alt=""
                className="w-24 md:w-36 lg:w-40 rounded-2xl "
              />
              <div className="flex flex-col space-y-2">
                <div>
                  {movie.original_title
                    ? movie.original_title
                    : movie.original_name}
                </div>
                <div>
                  {movie.original_title
                    ? movie.release_date.split("-")[0]
                    : movie.first_air_date &&
                      movie.first_air_date.split("-")[0] +
                        " - " +
                        (movie.status === "Ended"
                          ? movie.last_air_date.split("-")[0]
                          : "Present")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center mt-10 text-gray-500">
            No search results yet. Start by searching for your favorite movies
            or TV shows!
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;

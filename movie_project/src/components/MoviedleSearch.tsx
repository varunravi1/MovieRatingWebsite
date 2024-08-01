import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
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
  genres: any[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  credits: {
    cast: any[];
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
interface Props {
  selectedEra: string;
  onClick: (movie: Movie) => void;
  // dropDown: boolean;
  // setdropDown: React.Dispatch<React.SetStateAction<boolean>>;
}
function MoviedleSearch({ selectedEra, onClick }: Props) {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [search, updateSearch] = useState("");
  useEffect(() => {
    if (search === "") {
      setResults([]);
    }
  }, [search]);

  const handleDebounceChange = useCallback(
    debounce(async (inputValue: string) => {
      axios
        .post("homepage/search", {
          search: inputValue,
        })
        .then((response) => {
          setResults(
            response.data.movies.results
              .filter((movie: Movie) => {
                return movie.original_language === "en";
              })
              .filter((movie: Movie) => {
                if (selectedEra === "") return true;
                const releaseYear = new Date(movie.release_date).getFullYear();
                // Check for invalid date
                if (isNaN(releaseYear)) {
                  return false;
                }

                switch (selectedEra) {
                  case "1985-2000":
                    return releaseYear >= 1985 && releaseYear <= 2000;
                  case "2000-2015":
                    return releaseYear >= 2000 && releaseYear <= 2015;
                  case "2015-2024":
                    return releaseYear >= 2015 && releaseYear <= 2024;
                  default:
                    return false;
                }
              })
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }, 300),
    []
  );
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch(event.target.value);
    if (event.target.value.length >= 2) {
      handleDebounceChange(event.target.value);
    }
  };
  return (
    <div className="flex flex-col items-center w-full px-4">
      <div className="w-full max-w-md">
        <form className="mb-2">
          <div className="flex items-center bg-plat rounded-full shadow py-2 px-3">
            <BsSearch className="text-yt-black mr-2" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search for movie/show"
              type="search"
              className="w-full bg-transparent outline-none border-none text-yt-black mukta-regular text-sm"
            />
          </div>
        </form>
        <div
          className={`overflow-y-auto search-results transition-all duration-300 ease-in-out
          ${results.length > 0 ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          bg-comp-black rounded-xl w-full max-w-md custom-scrollbar`}
        >
          {results.map((movie: Movie) => (
            <div
              key={movie.id}
              className="flex justify-between items-center hover:bg-slate-950 p-2"
              onClick={() => {
                onClick(movie);
                updateSearch("");
              }}
            >
              <div className="flex items-center">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  className="w-20 rounded-md mr-2"
                />
                <div className="text-plat mukta-regular text-sm">
                  {movie.original_title || movie.original_name}
                </div>
              </div>
              <div className="text-plat text-sm">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MoviedleSearch;

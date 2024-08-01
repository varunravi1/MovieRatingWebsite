import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
  FormEvent,
} from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import FlipLogin from "./FlipLogin";
import { ImCancelCircle } from "react-icons/im";
import { SearchContext } from "../SearchContext";
// interface Movie {
//   id: number;
//   original_title: string;
//   poster_path: string;
//   release_date: string;
//   original_language: string;
//   original_name: string;
// }
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
interface Movie {
  genre_ids: any[];
  created_by: any[];
  popularity: number;
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
interface Props {
  enableDropDown: boolean;
}
function SearchBar({ enableDropDown }: Props) {
  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const { setSearchResults } = useContext(SearchContext);
  const [search, updateSearch] = useState("");
  const allSearch = useRef<Movie[]>([]);
  useEffect(() => {
    if (search === "") {
      setSearchResult([]);
    }
  }, [search]);

  const handleDebounceChange = useCallback(
    debounce(async (inputValue: string) => {
      axios
        .post("homepage/search", {
          search: inputValue,
        })
        .then((response) => {
          setSearchResult(
            response.data.movies.results
              .slice(0, 2)
              .concat(response.data.tv.results.slice(0, 2))
          );
          allSearch.current = response.data.movies.results
            .concat(response.data.tv.results)
            .sort((a: Movie, b: Movie) => b.popularity - a.popularity);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 600),
    []
  );
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch(event.target.value);
    if (event.target.value.length >= 3) {
      handleDebounceChange(event.target.value);
    }
  };
  const handleSearchClick = (movie: Movie) => {
    navigate(`/${movie.original_title ? "movie" : "tv"}/${movie.id}`);
  };
  const handleSearchEnter = (event: FormEvent) => {
    event.preventDefault();

    setSearchResults(allSearch.current);
    navigate(`/searchresults`);
  };
  return (
    <>
      <div>
        <form onSubmit={handleSearchEnter}>
          <div className="flex items-center bg-plat rounded-3xl shadow w-full ">
            <div className="pl-3 ml-2">
              <BsSearch style={{ color: "#121212" }} />
            </div>

            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search for movie/show"
              type="search"
              className="flex w-full outline-none border-none bg-transparent ml-2  px-2 caret-yt-black text-yt-black mukta-regular"
            />
            <button
              className="bg-purp-light w-52 h-full rounded-3xl py-3 transition-all hover:scale-105 hover:bg-purp active:shadow-inner focus:shadow-inner mukta-regular"
              type="submit"
            >
              Search
            </button>
          </div>
        </form>
        {enableDropDown && (
          <div className="search-results w-72 md:w-full bg-transparent cursor-pointer mt-2 rounded-2xl overflow-hidden overflow-y-hidden ">
            {searchResult != null ? (
              <>
                {searchResult.map((movie: Movie) => (
                  <div
                    key={movie.id}
                    className="bg-yt-black space-x-2 search-container hover:bg-slate-950"
                    onClick={() => {
                      handleSearchClick(movie);
                    }}
                  >
                    <img
                      key={movie.id}
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      className="w-20 mx-2 rounded-xl pb-1"
                    ></img>
                    <div className="mr-2 text-white mukta-regular ">
                      {movie.original_title
                        ? movie.original_title
                        : movie.original_name}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default SearchBar;

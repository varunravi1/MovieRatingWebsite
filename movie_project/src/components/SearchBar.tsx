import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
  original_name: string;
}

function SearchBar() {
  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [search, updateSearch] = useState("");
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
  const handleSearchEnter = () => {};
  //   const debouncedOnChange = debounce(handleSearch, 500);
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
              className="flex w-full outline-none border-none bg-transparent ml-2  px-2 caret-yt-black text-yt-black roboto-regular"
            />
            <button
              className="bg-purp-light w-52 h-full rounded-3xl py-3 transition-all hover:scale-105 hover:bg-purp active:shadow-inner focus:shadow-inner roboto-regular"
              type="submit"
            >
              Search
            </button>
          </div>
        </form>
        <div className="search-results bg-transparent cursor-pointer mt-2 rounded-2xl overflow-hidden overflow-y-hidden ">
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
                  <div className="mr-2 text-white roboto-regular ">
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
      </div>
    </>
  );
}

export default SearchBar;

import React from "react";
import { RiFilterOffFill } from "react-icons/ri";
interface Props {
  setMovieorTV: React.Dispatch<React.SetStateAction<string>>;
  MovieOrTV: string;
  selectedMovieGenres: number[];
  setSelectedMovieGenres: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTVGenres: number[];
  setSelectedTVGenres: React.Dispatch<React.SetStateAction<number[]>>;
}

enum MovieGenres {
  "Action" = 28,
  "Adventure" = 12,
  "Animation" = 16,
  "Comedy" = 35,
  "Crime" = 80,
  "Drama" = 18,
  "Family" = 10751,
  "Fantasy" = 14,
  "Horror" = 27,
  "Mystery" = 9648,
  "Romance" = 10749,
  "Science Fiction" = 878,
  "Thriller" = 53,
  "War" = 10752,
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

function SideBarMedia({
  MovieOrTV,
  setMovieorTV,
  selectedMovieGenres,
  selectedTVGenres,
  setSelectedMovieGenres,
  setSelectedTVGenres,
}: Props) {
  const toggleMovieGenre = (genre: number) => {
    setSelectedMovieGenres((prevGenres) =>
      prevGenres.includes(genre)
        ? prevGenres.filter((g) => g !== genre)
        : [...prevGenres, genre]
    );
  };
  const toggleTVGenre = (genre: number) => {
    setSelectedTVGenres((prevGenres) =>
      prevGenres.includes(genre)
        ? prevGenres.filter((g) => g !== genre)
        : [...prevGenres, genre]
    );
  };
  const handleResetGenreList = () => {
    if (MovieOrTV === "Movie") {
      setSelectedMovieGenres([]);
    } else if (MovieOrTV === "TV") {
      setSelectedTVGenres([]);
    }
  };
  return (
    <div className="bg-comp-black text-plat h-full flex flex-col space-y-6 py-4 px-4 roboto-bold rounded-3xl">
      <div
        className={` ${
          MovieOrTV === "Movie"
            ? "cursor-pointer rounded-lg py-2 pl-2 bg-purp-light"
            : "cursor-pointer hover:bg-purp rounded-lg py-2 pl-2 active:bg-purp-light"
        }`}
        onClick={() => {
          setMovieorTV("Movie");
        }}
      >
        Movies
      </div>
      <div
        className={` ${
          MovieOrTV === "TV"
            ? "cursor-pointer rounded-lg py-2 pl-2 bg-purp-light"
            : "cursor-pointer hover:bg-purp rounded-lg py-2 pl-2 active:bg-purp-light"
        }`}
        onClick={() => {
          setMovieorTV("TV");
        }}
      >
        TV Shows
      </div>
      <div className="flex justify-center items-center mt-6 text-lg font-bold text-plat ml-2">
        Genres
        <RiFilterOffFill
          className={`p-1 rounded-full ml-2 ${
            (MovieOrTV === "Movie" && selectedMovieGenres.length === 0) ||
            (MovieOrTV === "TV" && selectedTVGenres.length === 0)
              ? "opacity-30"
              : "cursor-pointer hover:bg-red-700"
          }`}
          onClick={handleResetGenreList}
          size={30}
        />
      </div>
      <hr />
      {MovieOrTV === "Movie"
        ? Object.keys(MovieGenres)
            .filter((key) => isNaN(Number(key))) // Filter out numeric keys
            .map((genreName) => {
              const genreId =
                MovieGenres[genreName as keyof typeof MovieGenres];
              return (
                <div
                  key={genreId}
                  onClick={() => toggleMovieGenre(genreId)}
                  className={`rounded-lg py-2 pl-2 ${
                    selectedMovieGenres.includes(genreId)
                      ? "bg-purp-light"
                      : "hover:bg-purp active:bg-purp-light"
                  }`}
                >
                  {genreName}
                </div>
              );
            })
        : Object.keys(TVGenres)
            .filter((key) => isNaN(Number(key))) // Filter out numeric keys
            .map((genreName) => {
              const genreId = TVGenres[genreName as keyof typeof TVGenres];
              return (
                <div
                  key={genreId}
                  onClick={() => toggleTVGenre(genreId)}
                  className={`rounded-lg py-2 pl-2 ${
                    selectedTVGenres.includes(genreId)
                      ? "bg-purp-light"
                      : "hover:bg-purp active:bg-purp-light"
                  }`}
                >
                  {genreName}
                </div>
              );
            })}
    </div>
  );
}

export default SideBarMedia;

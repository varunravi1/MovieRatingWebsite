import React, { useState } from "react";
import NavBarLoggedIn from "./NavBarLoggedIn";
import SearchBar from "./SearchBar";
import SideBarMedia from "./SideBarMedia";
import MoviesPage from "./MoviesPage";
import TVPage from "./TVPage";

function Discover() {
  const [MovieOrTV, setMovieorTV] = useState("Movie");
  const [selectedMovieGenres, setSelectedMovieGenres] = useState<number[]>([]);
  const [selectedTVGenres, setSelectedTVGenres] = useState<number[]>([]);
  return (
    <>
      <div className="main-container min-h-screen shadow-lg">
        <NavBarLoggedIn />
        <div className="mt-8">
          <SearchBar />
        </div>
        <div className="flex-row mt-2 md:flex">
          <div className="mt-4 w-full md:w-60 shrink-0 sticky top-0">
            <SideBarMedia
              selectedMovieGenres={selectedMovieGenres}
              selectedTVGenres={selectedTVGenres}
              setSelectedMovieGenres={setSelectedMovieGenres}
              setSelectedTVGenres={setSelectedTVGenres}
              setMovieorTV={setMovieorTV}
              MovieOrTV={MovieOrTV}
            ></SideBarMedia>
          </div>
          {MovieOrTV === "Movie" ? (
            <MoviesPage selectedMovieGenres={selectedMovieGenres}></MoviesPage>
          ) : (
            <TVPage selectedTVGenres={selectedTVGenres}></TVPage>
          )}
        </div>
      </div>
      <div className="footer"></div>
    </>
  );
}

export default Discover;

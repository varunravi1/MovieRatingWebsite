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
      <div className="main-container shadow-lg min-h-svh">
        <NavBarLoggedIn />
        <div className="mt-8">
          <SearchBar />
        </div>
        <div className="flex mt-2">
          <div className="mt-4 w-60 min-h-svh shrink-0">
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

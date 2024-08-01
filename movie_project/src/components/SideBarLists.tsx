import React, { Dispatch, SetStateAction } from "react";
interface Props {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}
function SideBarLists({ selected, setSelected }: Props) {
  const handleClickMovies = () => {
    if (selected == "Movie") {
      setSelected("All");
    } else {
      setSelected("Movie");
    }
  };

  const handleClickTVShows = () => {
    if (selected == "TV") {
      setSelected("All");
    } else {
      setSelected("TV");
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex bg-comp-black text-plat h-full flex-col space-y-6 py-4 px-4 mukta-bold rounded-3xl">
        <div
          className={` ${
            selected === "Movie"
              ? "cursor-pointer rounded-lg py-2 pl-2 bg-purp-light"
              : "cursor-pointer hover:bg-purp rounded-lg py-2 pl-2 active:bg-purp-light"
          }`}
          onClick={handleClickMovies}
        >
          Movies
        </div>
        <div
          className={` ${
            selected === "TV"
              ? "cursor-pointer rounded-lg py-2 pl-2 bg-purp-light"
              : "cursor-pointer hover:bg-purp rounded-lg py-2 pl-2 active:bg-purp-light"
          }`}
          onClick={handleClickTVShows}
        >
          TV Shows
        </div>
      </div>
      {/* Mobile Sidebar */}
      <div className="lg:hidden flex items-center bg-yt-black text-plat justify-center space-x-20 py-4 mukta-bold rounded-3xl">
        <div
          className={`md:text-xl p-2${
            selected === "Movie"
              ? "cursor-pointer rounded-lg bg-purp-light"
              : "cursor-pointer hover:bg-purp rounded-lg  active:bg-purp-light"
          }`}
          onClick={handleClickMovies}
        >
          Movies
        </div>
        <div
          className={`md:text-xl p-2 ${
            selected === "TV"
              ? "cursor-pointer rounded-lg bg-purp-light"
              : "cursor-pointer hover:bg-purp rounded-lg active:bg-purp-light"
          }`}
          onClick={handleClickTVShows}
        >
          TV Shows
        </div>
      </div>
    </>
  );
}

export default SideBarLists;

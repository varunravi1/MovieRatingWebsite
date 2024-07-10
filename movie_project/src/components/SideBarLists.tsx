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
    <div className="bg-comp-black text-plat h-full flex flex-col space-y-6 py-4 px-4 roboto-bold rounded-3xl">
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
  );
}

export default SideBarLists;

import { useContext, useRef, useState } from "react";
import { LoginContext } from "../userContext";
import NavBarLoggedIn from "./NavBarLoggedIn";
import Scroller from "./Scroller";
import "../HomePage.css";
import SearchBar from "./SearchBar";
import PopUpLists from "./PopUpLists";
import { useScroll } from "@react-spring/web";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
}
function HomePage() {
  const { user, updateUser } = useContext(LoginContext);
  const [listScreen, setListScreen] = useState(false);
  let mediaData = useRef<Movie | null>(null);
  return (
    <>
      <div className="main-container shadow-lg">
        <NavBarLoggedIn />
        <div className="mt-8">
          <SearchBar></SearchBar>
        </div>

        <div className="">
          <Scroller mediaData={mediaData} setListScreen={setListScreen} />
        </div>
        {listScreen && (
          <PopUpLists
            mediaData={mediaData}
            setListScreen={setListScreen}
          ></PopUpLists>
        )}
      </div>
    </>
  );
}

export default HomePage;

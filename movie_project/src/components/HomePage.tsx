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
  const [rerenderBookmark, setrerenderBookmark] = useState(false);
  const mediaData = useRef<Movie | null>(null);
  console.log(user);
  return (
    <>
      <div className="main-container shadow-lg min-h-svh">
        <NavBarLoggedIn />
        <div className="mt-8">
          <SearchBar enableDropDown={true} />
        </div>

        <div className="">
          <Scroller
            rerenderBookmark={rerenderBookmark}
            setrerenderBookmark={setrerenderBookmark}
            listScreen={listScreen}
            mediaData={mediaData}
            setListScreen={setListScreen}
          />
        </div>
        {listScreen && (
          <PopUpLists
            rerenderBookmark={rerenderBookmark}
            setrerenderBookmark={setrerenderBookmark}
            mediaData={mediaData}
            setListScreen={setListScreen}
          ></PopUpLists>
        )}
      </div>
      <div className="footer"> HELLO</div>
    </>
  );
}

export default HomePage;

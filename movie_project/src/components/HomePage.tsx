import { useContext, useRef, useState } from "react";
import { LoginContext } from "../userContext";
import NavBarLoggedIn from "./NavBarLoggedIn";
import Scroller from "./Scroller";
import "../HomePage.css";
import SearchBar from "./SearchBar";
import PopUpLists from "./PopUpLists";
import { useScroll } from "@react-spring/web";
import FlipLogin from "./FlipLogin";
import { ImCancelCircle } from "react-icons/im";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
  in_list: Boolean;
}

function HomePage() {
  // const { user, updateUser } = useContext(LoginContext);
  const [login, setLogin] = useState(false);
  return (
    <>
      <div className="main-container shadow-lg min-h-svh">
        <NavBarLoggedIn />
        <div className="mt-8">
          <SearchBar enableDropDown={true} />
        </div>
        <h1 className="text-white bg-yt-black text-center mukta-bold text-xl xl:text-4xl lg:text-4xl md:text-2xl: sm:text-2xl  pt-8 tracking-[1px] ">
          NEW RELEASES
        </h1>
        <Scroller setLogin={setLogin} type="movie" />
        <h1 className="text-white bg-yt-black text-center mukta-bold text-xl xl:text-4xl lg:text-4xl md:text-2xl: sm:text-2xl  pt-8 tracking-[1px] ">
          NOW AIRING
        </h1>
        <Scroller setLogin={setLogin} type="tv" />
      </div>
      {login && (
        <div className=" bg-yt-black bg-opacity-70 fixed top-0 left-0 flex w-svw h-svh z-50">
          <FlipLogin></FlipLogin>
          <ImCancelCircle
            onClick={() => {
              setLogin(false);
            }}
            className="absolute top-5 right-10 cursor-pointer bg-transparent border-none "
            size={30}
            color="#FFF"
          />
        </div>
      )}
      <div className="footer"> HELLO</div>
    </>
  );
}

export default HomePage;

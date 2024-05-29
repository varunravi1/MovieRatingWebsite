import { useContext } from "react";
import { LoginContext } from "../userContext";
import NavBarLoggedIn from "./NavBarLoggedIn";
import Scroller from "./Scroller";
import "../HomePage.css";
import SearchBar from "./SearchBar";
function HomePage() {
  const { user, updateUser } = useContext(LoginContext);
  return (
    <>
      <div className="main-container shadow-lg">
        <NavBarLoggedIn />
        <div className="mt-8">
          <SearchBar></SearchBar>
        </div>

        <div className="">
          <Scroller />
        </div>
      </div>
    </>
  );
}

export default HomePage;

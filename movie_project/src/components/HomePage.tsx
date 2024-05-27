import { useContext } from "react";
import { LoginContext } from "../userContext";
import NavBarLoggedIn from "./NavBarLoggedIn";
import Scroller from "./Scroller";
function HomePage() {
  const { user, updateUser } = useContext(LoginContext);
  return (
    <>
      <div className="mb-20">
        <NavBarLoggedIn></NavBarLoggedIn>
      </div>

      {/* <img src={varuiable} className="mt-20"></img> */}
      <Scroller></Scroller>
    </>
  );
}

export default HomePage;

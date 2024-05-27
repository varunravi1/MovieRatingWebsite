import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../userContext";
import SearchBar from "./SearchBar";
function NavBarLoggedIn() {
  const { user, updateUser } = useContext(LoginContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    axios.delete("/refresh_token").then((response) => {
      console.log(response);
      console.log("Successfully deleted refresh token and logged out");
      updateUser(null);
      navigate("/");
    });
  };
  return (
    <>
      <div className="fixed flex top-0 left-0 right-0 z-10 justify-center bg-yt-black py-5 pl-20">
        <div className="flex space-x-20 max-w-md bg-gray-600">
          <button className="navBar">Home</button>
          <button className="navBar">Movies</button>
          <button className="navBar">TV Shows</button>
          <button className="navBar">Books</button>
        </div>
        <div className="flex space-x-28 justify-end items-center bg-yellow-600">
          <button className="navBar " onClick={handleLogout}>
            Logout
          </button>
          <SearchBar></SearchBar>
        </div>
      </div>
    </>
  );
}

export default NavBarLoggedIn;

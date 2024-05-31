import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../userContext";
import SearchBar from "./SearchBar";
import { ImCancelCircle } from "react-icons/im";
import FlipLogin from "./FlipLogin";
function NavBarLoggedIn() {
  const { user, updateUser } = useContext(LoginContext);
  const [signUp, setSignUp] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    axios.delete("/refresh_token").then((response) => {
      console.log(response);
      console.log("Successfully deleted refresh token and logged out");
      updateUser(null);
      navigate("/");
    });
  };
  useEffect(() => {
    console.log("user has been updated");
  }, [user]);
  console.log("This is what is stored in user");
  console.log(user);
  return (
    <>
      {signUp ? (
        <div className=" bg-yt-black bg-opacity-70 fixed top-0 left-0 flex w-svw h-svh z-50">
          <FlipLogin></FlipLogin>
          <ImCancelCircle
            onClick={() => {
              setSignUp(false);
            }}
            className="absolute top-5 right-10 cursor-pointer bg-transparent border-none "
            size={30}
            color="#FFF"
          />
        </div>
      ) : (
        <></>
      )}

      <div className="fixed-bar flex justify-between px-5">
        <Link to={"/HomePage"} className="navBar roboto-bold">
          Home
        </Link>
        <button className="navBar roboto-bold hidden sm:inline-block">
          Movies
        </button>
        <button className="navBar roboto-bold hidden md:inline-block">
          TV Shows
        </button>
        <button className="navBar roboto-bold hidden xl:inline-block">
          Books
        </button>
        {user && (
          <button className="navBar roboto-bold hidden lg:inline-block">
            My Lists
          </button>
        )}
        {user ? (
          <button className="navBar roboto-bold" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <button
              className="navBar roboto-bold"
              onClick={() => {
                setSignUp(true);
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default NavBarLoggedIn;

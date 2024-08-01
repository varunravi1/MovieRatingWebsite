import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../userContext";
import SearchBar from "./SearchBar";
import { ImCancelCircle } from "react-icons/im";
import FlipLogin from "./FlipLogin";
import { IoIosSettings } from "react-icons/io";
import UserMenu from "./UserMenu";
import { RxHamburgerMenu } from "react-icons/rx";
import NavBarSideBar from "./NavBarSideBar";

function NavBarLoggedIn() {
  const { user, updateUser } = useContext(LoginContext);
  const [sideBar, setSideBar] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    axios.delete("/refresh_token").then((response) => {
      console.log(response);
      localStorage.setItem("accessToken", "");
      console.log("Successfully deleted refresh token and logged out");
      setMenu(false);
      updateUser(null);
      navigate("/");
    });
  };
  useEffect(() => {
    console.log("user has been updated");
    setSignUp(false);
  }, [user]);
  return (
    <>
      {signUp && (
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
      )}

      <div className=" fixed-bar flex justify-between px-5">
        <RxHamburgerMenu
          className="navBar mukta-bold inline-block lg:hidden cursor-pointer"
          size={30}
          onClick={() => {
            setSideBar(!sideBar);
          }}
        />
        <div className="absolute overflow-hidden transition-all">
          <NavBarSideBar sideBar={sideBar} setSideBar={setSideBar} />
        </div>
        <Link to={"/"} className="navBar mukta-bold hidden lg:inline-block">
          Home
        </Link>
        <button
          className="navBar mukta-bold hidden lg:inline-block"
          onClick={() => navigate("/discover")}
        >
          Discover
        </button>
        <button
          className="navBar mukta-bold hidden xl:inline-block"
          onClick={() => navigate("/Moviedle")}
        >
          Moviedle
        </button>
        {user ? (
          <div className="relative">
            <IoIosSettings
              size={30}
              className="navBar bg-white cursor-pointer hover:rotate-90 transition-all hover:scale-110"
              onClick={() => {
                setMenu(!menu);
              }}
            />
            {menu && (
              <div className="absolute top-9 right-4 z-50">
                <UserMenu onClick={handleLogout} />
              </div>
            )}
          </div>
        ) : (
          // <button className="navBar mukta-bold" onClick={handleLogout}>
          //   Logout
          // </button>

          <>
            <button
              className="navBar mukta-bold"
              onClick={() => {
                setSignUp(true);
              }}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default NavBarLoggedIn;

import React, { useEffect, useRef } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSearch } from "react-icons/bs";
import { RiMovie2Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { RiHome2Fill } from "react-icons/ri";
interface Props {
  setSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  sideBar: boolean;
}
function NavBarSideBar({ sideBar, setSideBar }: Props) {
  const refToSideBar = useRef<HTMLDivElement>(null);
  const handleTouchStart = (e: TouchEvent) => {
    if (!refToSideBar.current?.contains(e.target as Node)) {
      setSideBar(false);
    }
  };
  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);
  const navigate = useNavigate();
  return (
    <>
      <div
        ref={refToSideBar}
        className={`bg-comp-black fixed top-0 left-0 z-50 h-full transition-all overflow-hidden ${
          sideBar ? "w-64" : "w-0"
        }`}
      >
        <RxHamburgerMenu
          className="roboto-bold inline-block lg:hidden ml-10 my-5 cursor-pointer"
          size={30}
          onClick={() => {
            setSideBar(false);
          }}
        />
        <div
          className="flex items-center justify-left pl-10 py-2 rounded-xl space-x-6 my-4 hover:bg-very-light-black"
          onClick={() => {
            navigate("/");
          }}
        >
          <RiHome2Fill />
          <p>Home</p>
        </div>

        <div
          className="flex items-center justify-left pl-10 py-2 rounded-xl space-x-6 my-4 hover:bg-very-light-black"
          onClick={() => {
            navigate("/discover");
          }}
        >
          <BsSearch />
          <p>Discover</p>
        </div>
        <div className="flex items-center justify-left pl-10 py-2 rounded-xl space-x-6 my-4 hover:bg-very-light-black">
          <RiMovie2Line />
          <p>Moviedle</p>
        </div>
      </div>
    </>
  );
}

export default NavBarSideBar;

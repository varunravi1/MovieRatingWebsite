import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { CgAdd } from "react-icons/cg";
import { LoginContext } from "../userContext";
import NavBarLoggedIn from "./NavBarLoggedIn";
import SideBarLists from "./SideBarLists";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
}
interface media {
  _id: string;
  mediaType: string;
  title: string;
  media: Movie[];
}
interface RefObject {
  [key: string]: HTMLDivElement | null;
}
function MyLists() {
  const navigate = useNavigate();
  const { user, isAuthLoading } = useContext(LoginContext);
  const [listData, setListData] = useState<any[] | null>([]);
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("Movie");
  const [createList, setcreateList] = useState(false);
  const scrollPos = useRef<RefObject>({});

  useEffect(() => {
    console.log(isAuthLoading);
    if (!isAuthLoading) getLists();
  }, [user]);
  const getLists = async () => {
    try {
      console.log("in getLists");
      const results = await axios.post("/user/list", { user: user });
      setListData(results.data.listData);
      console.log(results.data);
    } catch (error) {
      console.log(error);
    }
  };
  const movieLists = listData?.map((list: media) => {
    if (list.mediaType == "Movie") {
      return list;
    }
  });
  // console.log(movieLists);
  const tvLists = listData?.map((list: media) => {
    if (list.mediaType == "TV") {
      return list;
    }
  });
  // console.log(tvLists);
  const bookLists = listData?.map((list: media) => {
    if (list.mediaType == "Books") {
      return list;
    }
  });
  const handleMovieClick = (movie: Movie) => {
    navigate(`/${movie.original_title ? "movie" : "tv"}/${movie.id}`);
  };
  const handleCreateList = async () => {
    console.log(mediaType);
    console.log(title);
    try {
      const results = await axios.post("/user/list/add", {
        user: user,
        title: title,
        media: mediaType,
      });
      console.log(results);
      setcreateList(false);
    } catch (error) {}
  };
  // const handleScrollLeft = () => {
  //   if (scrollPos.current) {
  //     scrollPos.current.scrollBy({ left: -300, behavior: "smooth" }); // Adjust the value as needed
  //   }
  // };
  // const handleScrollRight = () => {
  //   if (scrollPos.current) {
  //     console.log(scrollPos.current);
  //     scrollPos.current.scrollBy({ left: 200, behavior: "smooth" }); // Adjust the value as needed
  //     console.log(scrollPos.current.scrollLeft);
  //   }
  // };
  const handleScroll = (id: string, direction: "left" | "right"): void => {
    const element = scrollPos.current[id];
    if (element) {
      element.scrollBy({
        left: direction === "left" ? -600 : 600,
        behavior: "smooth",
      });
    }
  };
  // console.log(bookLists);
  return (
    <>
      <div className="main-container shadow-lg min-h-svh">
        <NavBarLoggedIn></NavBarLoggedIn>
        <div className="flex pt-2">
          <div className="mt-4 w-60 min-h-svh shrink-0">
            <SideBarLists></SideBarLists>
          </div>
          <div className="w-[80%]">
            {listData?.length === 0 ? (
              <>
                <div
                  className="ml-8 flex items-center w-40 space-x-4 cursor-pointer bg-yt-black py-2 rounded-xl hover:bg-plat hover:text-yt-black pop-up-lists"
                  tabIndex={0}
                  onClick={() => {
                    console.log("clicking button");
                    setcreateList(true);
                  }}
                >
                  <CgAdd size={25} className="ml-4 my-2" />
                  <p className="text-center mt-1 transition-all">Create List</p>
                </div>
              </>
            ) : (
              <>
                <div className=" max-h-full mb-3">
                  {listData?.map((list: media) => (
                    <div className="" key={list._id}>
                      <div
                        className="roboto-bold tracking-wider ml-8 mb-8 mt-4 py-4 pl-4 text-plat text-xl"
                        onClick={() => {
                          // handleAddtoList(list);
                        }}
                      >
                        {list.title}
                      </div>
                      <div className="flex items-center justify-between">
                        <IoIosArrowBack
                          size={60}
                          color="white"
                          onClick={() => handleScroll(list._id, "left")}
                          className="cursor-pointer flex-shrink-0"
                        />
                        <div
                          className="text-whitepx-4 mb-8 flex space-x-16 roboto-regular  overflow-hidden"
                          // key={list.title}
                          ref={(divElement) =>
                            (scrollPos.current[list._id] = divElement)
                          }
                        >
                          {list.media.map((movie: Movie) => (
                            <div className="hover:bg-comp-black rounded-2xl flex flex-col items-center p-4 cursor-pointer">
                              <img
                                key={movie.id}
                                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                className="max-w-56 rounded-2xl"
                                onClick={() => handleMovieClick(movie)}
                                // alt={`Poster for ${movie.title}`}
                              />
                              <p className="mt-6">{movie.original_title}</p>
                            </div>
                          ))}
                        </div>
                        <IoIosArrowForward
                          size={60}
                          color="white"
                          onClick={() => handleScroll(list._id, "right")}
                          className="cursor-pointer flex-shrink-0 content-end"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="ml-8 flex items-center w-40 space-x-4 cursor-pointer bg-yt-black py-2 rounded-xl hover:bg-another-black pop-up-lists"
                  tabIndex={0}
                  id="create-list-button"
                  onClick={() => {
                    console.log("clicking button");
                    setcreateList(true);
                  }}
                >
                  <CgAdd size={25} className="ml-4 my-2" />
                  <p className="text-center mt-1 transition-all">Create List</p>
                </div>
              </>
            )}
          </div>
          {createList && (
            <div className="absolute bg-gray-200 w-[350px] rounded-2xl p-4 flex flex-col items-center justify-center">
              <div className="mb-4 w-full">
                <label
                  className="block text-gray-800 font-roboto mb-1"
                  htmlFor="list-name"
                >
                  List Name
                </label>
                <input
                  type="text"
                  id="list-name"
                  className="form-input w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yt-black focus:border-transparent caret-black text-gray-800"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="mb-4 w-full">
                <label
                  className="block text-gray-800 font-roboto mb-1"
                  htmlFor="media-type"
                >
                  Media Type
                </label>
                <select
                  id="media-type"
                  className="form-select w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yt-black focus:border-transparent text-gray-800"
                  value={mediaType}
                  onChange={(event) => setMediaType(event.target.value)} // Handle change to update state
                >
                  <option value="Movie">Movie</option>
                  <option value="TV">TV</option>
                  <option value="Book">Book</option>
                </select>
              </div>

              <div className="w-full">
                <button
                  className="w-full bg-dim-gray hover:bg-yt-black text-white font-bold py-2 px-4 rounded-md shadow active:scale-95 active:ring-4 ring-purp"
                  onClick={handleCreateList}
                >
                  Create List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyLists;

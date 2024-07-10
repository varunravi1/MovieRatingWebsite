import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { CgAdd } from "react-icons/cg";
import { LoginContext } from "../userContext";
import NavBarLoggedIn from "./NavBarLoggedIn";
import SideBarLists from "./SideBarLists";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { ImCancelCircle } from "react-icons/im";
import { FaTrash } from "react-icons/fa";
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
  const [selected, setSelected] = useState("All");
  const { user, isAuthLoading } = useContext(LoginContext);
  const [listData, setListData] = useState<media[] | null>([]);
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
      // tempData.current = results.data.listData;
      setListData(results.data.listData);
    } catch (error) {
      console.log(error);
    }
  };
  const handleMovieClick = (movie: Movie) => {
    navigate(`/${movie.original_title ? "movie" : "tv"}/${movie.id}`);
  };
  const handleCreateList = async () => {
    try {
      const results = await axios.post("/user/list/add", {
        user: user,
        title: title,
        media: mediaType,
      });
      const newList = {
        _id: results.data.created._id,
        mediaType: mediaType,
        title: title,
        media: [],
      };
      setListData((prevListData) => {
        if (!prevListData) {
          return [newList];
        } else {
          return [...prevListData, newList];
        }
      });

      console.log("after creating list");
      console.log(results.data);
      setcreateList(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleScroll = (id: string, direction: "left" | "right") => {
    const element = scrollPos.current[id];
    if (element) {
      element.scrollBy({
        left: direction === "left" ? -600 : 600,
        behavior: "smooth",
      });
    }
  };
  const handleDeleteItemFromList = async (list: media, movie: Movie) => {
    await axios.patch(`/user/list${list._id}`, {
      user: user,
      title: list.title,
      action: "remove",
      mediaItem: movie,
    });
    setListData((prevListData) => {
      if (!prevListData) return null;
      return prevListData.map((listmap) =>
        listmap._id === list._id
          ? {
              ...listmap,
              media: listmap.media.filter(
                (moviemap: Movie) => moviemap.id !== movie.id
              ),
            }
          : listmap
      );
    });
  };
  const handleDeleteList = async (listTitle: String, listID: String) => {
    try {
      const response = await axios.delete(`/user/list${listID}`, {
        data: {
          user: user,
          title: listTitle,
        },
      });

      setListData((prevListData) => {
        if (!prevListData) {
          return prevListData;
        } else {
          return prevListData.filter((list) => list.title !== listTitle);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="main-container shadow-lg min-h-svh">
        <NavBarLoggedIn></NavBarLoggedIn>
        <div className="flex pt-2">
          <div className="mt-4 w-60 min-h-svh shrink-0">
            <SideBarLists
              setSelected={setSelected}
              selected={selected}
            ></SideBarLists>
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
                  {listData
                    ?.filter((list: media) => {
                      if (selected == "All") {
                        return list;
                      } else {
                        return list.mediaType === selected;
                      }
                    })
                    .map((list: media) => (
                      <div className="" key={list._id}>
                        <div
                          className=" group roboto-bold relative tracking-wider ml-8 mb-8 mt-4 py-4 pl-4 text-plat text-xl hover:bg-comp-black"
                          onClick={() => {
                            // handleAddtoList(list);
                          }}
                        >
                          {list.title}
                          <FaTrash
                            onClick={() => {
                              handleDeleteList(list.title, list._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 absolute top-4 right-3 hover:scale-125 cursor-pointer"
                            size={25}
                            color="#d3d3d3"
                          />
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
                              <div className="group relative hover:bg-comp-black rounded-2xl flex flex-col items-center p-4 cursor-pointer">
                                <div className="opacity-0 group-hover:opacity-100">
                                  <FaTrash
                                    onClick={() => {
                                      handleDeleteItemFromList(list, movie);
                                    }}
                                    className="absolute top-5 right-3 hover:scale-125"
                                    size={25}
                                    color="#d3d3d3"
                                  />
                                </div>
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
            <div className="overlay-container">
              <ImCancelCircle
                onClick={() => {
                  setcreateList(false);
                }}
                className="absolute top-5 right-10 cursor-pointer bg-transparent border-none "
                size={30}
                color="#FFF"
              />
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyLists;

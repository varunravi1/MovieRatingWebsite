import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { LoginContext } from "../userContext";
import axios from "axios";
import { CgAdd } from "react-icons/cg";
import { ImCancelCircle } from "react-icons/im";
import { set } from "zod";

interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  backdrop_path: string;
  original_name: string;
  overview: string;
  genres: any[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  cast: any[];
  director: string;
  trailer: {
    key: string;
  };
  first_air_date: string;
  last_air_date: string;
  audienceScore: string;
  criticScore: string;
  status: string;
}
interface media {
  _id: string;
  mediaType: string;
  title: string;
  media: {};
}
interface Props {
  tvormov: Movie;
  setPopUpLists: Dispatch<SetStateAction<boolean>>;
  setBookMarkValue: Dispatch<SetStateAction<boolean>>;
}
function PopUpLists2({ tvormov, setPopUpLists, setBookMarkValue }: Props) {
  const { user } = useContext(LoginContext);
  const [listData, setListData] = useState<any[] | null>([]);
  const [createList, setcreateList] = useState(false);
  const [title, setTitle] = useState("");
  useEffect(() => {
    getLists();
  }, []);
  const mediaType = tvormov.original_title == null ? "TV" : "Movie";

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
  const handleCreateList = async () => {
    try {
      const results = await axios.post("/user/list/add", {
        user: user,
        title: title,
        media: mediaType,
      });
      console.log(results);
      setcreateList(false);
      setListData((prevListData) => {
        return prevListData
          ? [...prevListData, results.data.created]
          : [results.data.created];
      });
    } catch (error) {}
  };
  const handleAddtoList = async (list: media) => {
    try {
      console.log(list._id);
      console.log("Trying to add to list");
      const response = await axios.patch(`/user/list${list._id}`, {
        title: list.title,
        user: user,
        mediaItem: tvormov,
        action: "add",
      });
      setPopUpLists(false);
      setBookMarkValue(true);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="fixed flex items-center justify-center pop-up-lists-container w-svw h-svh top-0 left-0">
        <div className="absolute bg-dim-gray w-[700px] h-[400px]">
          <ImCancelCircle
            className="absolute top-0 right-0 mr-3 mt-4 cursor-pointer"
            size={20}
            onClick={() => {
              setPopUpLists(false);
            }}
          ></ImCancelCircle>
          <div className="ml-8 my-8 roboto-bold tracking-wide">Your Lists</div>
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
              <div className=" max-h-56 overflow-auto mb-3">
                {listData
                  ?.filter((list: media) => {
                    console.log(mediaType);
                    return mediaType == "Movie"
                      ? list.mediaType == "Movie"
                      : list.mediaType == "TV";
                  })
                  .map((list: media) => (
                    <div className="" key={list._id}>
                      <div
                        className="roboto-bold tracking-wider px-4 mx-14 mb-6 py-4 text-plat cursor-pointer bg-yt-black rounded-2xl hover:bg-black-hover active:scale-95 active:ring-4 ring-purp overflow-auto"
                        onClick={() => {
                          handleAddtoList(list);
                        }}
                      >
                        {list.title}
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
        {createList ? (
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
              >
                {tvormov.original_title ? (
                  <option value="Movie">Movie</option>
                ) : (
                  <option value="TV">TV</option>
                )}
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
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default PopUpLists2;

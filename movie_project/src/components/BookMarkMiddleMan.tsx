import { useEffect, useState, useContext } from "react";
import { LoginContext } from "../userContext";
import { PiBookmarkSimple, PiBookmarkSimpleFill } from "react-icons/pi";
interface Movie {
  id: number;
  original_title: string;
  poster_path: string;
  release_date: string;
  original_language: string;
}
interface Props {
  fill: number;
  mediaData: React.MutableRefObject<Movie | null>;
  onClick: () => void;
  rerenderBookmark: boolean;
  movie: Movie;
  //   listScreen: boolean;
}
function BookMarkMiddleMan({
  fill,
  mediaData,
  onClick,
  rerenderBookmark,
  movie,
}: Props) {
  const { user } = useContext(LoginContext);
  const [localFill, setLocalFill] = useState(fill);
  useEffect(() => {
    console.log("re-rendering bookmark");
    if (movie === mediaData.current) {
      setLocalFill(fill === 1 ? 0 : 1);
    }
  }, [rerenderBookmark]);
  return (
    <>
      {localFill === 1 ? (
        <PiBookmarkSimpleFill
          className="size-9 absolute mt-56 bookmark-icon cursor-pointer"
          onClick={onClick}
        />
      ) : (
        <PiBookmarkSimple
          className="size-9 absolute mt-56 bookmark-icon cursor-pointer "
          onClick={onClick}
        />
      )}
    </>
  );
}

export default BookMarkMiddleMan;

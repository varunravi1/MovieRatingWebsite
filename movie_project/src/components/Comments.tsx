import React, { useContext, useEffect, useState } from "react";
import { LoginContext } from "../userContext";
import { CiUser } from "react-icons/ci";
import axios from "axios";
import FlipLogin from "./FlipLogin";
import { ImCancelCircle } from "react-icons/im";
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
interface Comment {
  id: string;
  email: string;
  username: string;
  comment: string;
  time: string;
  mediaType: string;
  mediaID: string;
}
interface Props {
  movie: Movie;
}

function Comments({ movie }: Props) {
  useEffect(() => {
    handleGetComment();
  }, []);
  const [login, setLogin] = useState(false);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const mediaType = movie.original_name == null ? "movie" : "tv";
  const { user } = useContext(LoginContext);
  const [comment, updateComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const handleAddComment = async () => {
    if (user == null) {
      setLogin(true);
    } else {
      console.log("inside add comment");
      const addComment = await axios.post("comments/add_comment", {
        user: user,
        mediaType: mediaType,
        mediaID: movie.id,
        comment: comment,
      });

      updateComment("");
      const newComment: Comment = {
        id: "",
        email: user,
        username: addComment.data,
        comment: comment,
        mediaType: mediaType,
        mediaID: movie.id.toString(),
        time: getCurrentUTCDateTimeString(),
      };
      setAllComments((prevComments) => [...prevComments, newComment]);
      console.log(addComment);
    }
  };
  const getCurrentUTCDateTimeString = () => {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const day = now.getUTCDate().toString().padStart(2, "0");

    const hours = now.getUTCHours().toString().padStart(2, "0");
    const minutes = now.getUTCMinutes().toString().padStart(2, "0");
    const seconds = now.getUTCSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  };
  const handleGetComment = async () => {
    const response = await axios.get(`/comments/${mediaType}/${movie.id}`);
    console.log(response);
    setAllComments(response.data);
  };
  const convertUTCToRelativeTime = (utcDateTimeString: string): string => {
    const utcDate = new Date(utcDateTimeString);
    const now = new Date();

    const diffInSeconds = Math.floor(
      (now.getTime() - utcDate.getTime()) / 1000
    );

    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInMonth = secondsInDay * 30;
    const secondsInYear = secondsInDay * 365;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${minutes} minutes ago`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      return `${hours} hours ago`;
    } else if (diffInSeconds < secondsInMonth) {
      const days = Math.floor(diffInSeconds / secondsInDay);
      return `${days} days ago`;
    } else if (diffInSeconds < secondsInYear) {
      const months = Math.floor(diffInSeconds / secondsInMonth);
      return `${months} months ago`;
    } else {
      const years = Math.floor(diffInSeconds / secondsInYear);
      return `${years} years ago`;
    }
  };
  return (
    <div id="search-comment" className="mt-6 ">
      <p className="roboto-bold my-4">Comments</p>

      <div className="bg-plat rounded-lg">
        <textarea
          placeholder="Enter a Comment"
          onFocus={() => setIsFocused(true)}
          name="comment"
          id="comment"
          value={comment}
          onChange={(event) => {
            updateComment(event.target.value);
          }}
          rows={3}
          className="w-full text-black px-3 pt-2 outline-none border-none bg-transparent resize-none"
        ></textarea>
      </div>
      {isFocused && (
        <div className="w-full flex justify-end items-center ">
          <button
            className="roboto-bold my-4 mx-4 px-4 py-2 rounded-xl bg-comp-black hover:bg-plat hover:text-comp-black"
            onClick={() => {
              updateComment("");
              setIsFocused(false);
            }}
          >
            Cancel
          </button>
          <button
            className="roboto-bold my-4 mx-4 px-4 py-2 rounded-xl bg-comp-black hover:bg-plat hover:text-comp-black"
            onClick={handleAddComment}
          >
            Submit
          </button>
        </div>
      )}
      {allComments.length != 0 ? (
        allComments
          ?.slice()
          .reverse()
          .map((comment: Comment) => (
            <div className="flex mt-6">
              <div className="rounded-full bg-very-light-black">
                <CiUser size={60} />
              </div>
              <div className="ml-4">
                <div className="flex">
                  <p>{comment.username}</p>
                  <p className="pl-3">
                    {convertUTCToRelativeTime(comment.time)}
                  </p>
                </div>
                <p className="">{comment.comment}</p>
              </div>
            </div>
          ))
      ) : (
        <div className="flex items-center justify-center pt-6 h-60">
          <p className="roboto-regular">
            No Comments. Be the first to comment!
          </p>
        </div>
      )}
      {login && (
        <div className=" bg-yt-black bg-opacity-70 fixed top-0 left-0 flex w-svw h-svh z-50">
          <FlipLogin></FlipLogin>
          <ImCancelCircle
            onClick={() => {
              setLogin(false);
            }}
            className="absolute top-5 right-10 cursor-pointer bg-transparent border-none "
            size={30}
            color="#FFF"
          />
        </div>
      )}
    </div>
  );
}

export default Comments;

import React, { useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import MobileSwiper from "./MobileSwiper";

interface RefObject {
  [key: string]: HTMLDivElement | null;
}
interface Props {
  scrollPos: React.MutableRefObject<RefObject>;
  data: any[];
  type: string;
}

export const getScrollDistance = (velocity: number): number => {
  const baseDistance = 300; // base distance in pixels
  const distance = baseDistance * velocity;
  return Math.min(Math.max(distance, 100), 2000); // constrain distance between 100px and 2000px
};
export const getScrollSpeed = () => {
  if (window.innerWidth >= 1024) {
    return 1100;
  } else if (window.innerWidth >= 768) {
    return 570;
  } else if (window.innerWidth >= 640) {
    return 200;
  } else {
    return 200;
  }
};
function ImageCarousel({ scrollPos, data, type }: Props) {
  const navigate = useNavigate();
  const whichSet = type === "backdrop" ? "images" : "cast";

  const handleScroll = (
    id: string,
    direction: "left" | "right",
    distance: number
  ) => {
    const element = scrollPos.current[id];
    if (element) {
      const startScroll = element.scrollLeft;
      const endScroll =
        direction === "left" ? startScroll - distance : startScroll + distance;
      smoothScroll(element, startScroll, endScroll, 500); // 500ms duration
    }
  };

  const smoothScroll = (
    element: HTMLElement,
    start: number,
    end: number,
    duration: number
  ) => {
    const startTime = Date.now();
    const distance = end - start;

    const scroll = () => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      element.scrollLeft = start + distance * easeOutQuad(progress);

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  };

  const easeOutQuad = (t: number) => t * (2 - t);

  const handleSwipe = ({
    deltaX,
    deltaY,
    velocityX,
  }: {
    deltaX: number;
    deltaY: number;
    velocityX: number;
  }) => {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const distance = getScrollDistance(Math.abs(velocityX));
      if (deltaX > 0) {
        handleScroll(whichSet, "left", distance);
      } else {
        handleScroll(whichSet, "right", distance);
      }
    }
  };
  return (
    // <MobileSwiper onSwipe={handleSwipe}>
    <div className="flex items-center w-full justify-between">
      <IoIosArrowBack
        size={25}
        color="white"
        onClick={() => {
          handleScroll(whichSet, "left", getScrollSpeed()); // default distance for button click
        }}
        className="cursor-pointer flex-shrink-0 active:bg-gray-700 active:rounded-full"
      />
      <div
        ref={(divElement) => (scrollPos.current[whichSet] = divElement)}
        className="flex items-center space-x-4 overflow-x-auto justify-between"
      >
        {data?.map((cast: any) => (
          <div
            className={`py-3 ${
              type === "backdrop" ? "w-64 lg:w-96" : "w-36 h-80 lg:w-40"
            } flex-shrink-0 cursor-pointer hover:underline`}
            key={cast.id}
            onClick={() => {
              if (type !== "backdrop") {
                navigate(`/actor/${cast.id}`);
              }
            }}
          >
            <img
              src={`${
                cast.profile_path
                  ? `https://image.tmdb.org/t/p/w500/${cast.profile_path}`
                  : `https://image.tmdb.org/t/p/w500/${cast.file_path}`
              }`}
              className={`rounded-xl mb-2`}
            ></img>
            {cast.name && cast.character && (
              <>
                <h1 className="roboto-regular text-base ">{cast.name}</h1>
                <p className="roboto-light text-xs ">{cast.character}</p>
              </>
            )}
          </div>
        ))}
      </div>
      <IoIosArrowForward
        size={25}
        color="white"
        onClick={() => {
          handleScroll(whichSet, "right", getScrollSpeed()); // default distance for button click
        }}
        className="cursor-pointer flex-shrink-0 active:bg-gray-700 active:rounded-full"
      />
    </div>
    // </MobileSwiper>
  );
}

export default ImageCarousel;

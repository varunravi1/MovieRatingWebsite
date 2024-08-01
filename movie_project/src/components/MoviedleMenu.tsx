import React, { useEffect, useRef, useState } from "react";
import NavBarLoggedIn from "./NavBarLoggedIn";
import { FaQuestion } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { divide } from "lodash";
import MoviedleGameScreen from "./MoviedleGameScreen";
interface Movie {
  created_by: any[];
  id: number;
  original_title: string;
  poster_path: string;
  backdrop_path: string;
  homepage: string;
  budget: number;
  revenue: number;
  tagline: string;
  original_name: string;
  overview: string;
  genres: any[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  credits: {
    cast: any[];
    crew: any[];
  };
  director: string;
  trailer: any;
  first_air_date: string;
  last_air_date: string;
  audienceScore: string;
  criticScore: string;
  status: string;
}
interface Props {
  setHowtoPlay: React.Dispatch<React.SetStateAction<boolean>>;
}
function MoviedleMenu() {
  const [selectedEra, setSelectedEra] = useState("");
  const [HowtoPlay, setHowtoPlay] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  // const navigate = useNavigate();

  const handleStartGame = async () => {
    getMovie();
    setGameStarted(true);
  };
  const getMovie = async () => {
    let query;
    console.log(selectedEra);
    if (selectedEra === "2015-2024") {
      query = "Modern";
    } else if (selectedEra === "2000-2015") {
      query = "Millennium";
    } else {
      query = "Classic";
    }

    const response = await axios.get(`/moviedle/getMovie${query}`);
    const tempData: Movie = response.data;
    const director = tempData.credits.crew.find(
      (person) => person.job === "Director"
    );
    tempData.director = director ? director.name : "";
    console.log(response.data);
    setMovie(tempData);
  };
  return (
    <>
      <div className="main-container shadow-lg min-h-svh mukta-regular">
        <NavBarLoggedIn />
        <h1 className="text-white bg-yt-black text-center mukta-bold text-xl xl:text-4xl lg:text-4xl md:text-2xl: sm:text-2xl  pt-8 tracking-[1px] mb-5">
          Moviedle
        </h1>
        {gameStarted === false ? (
          <>
            <div className="flex justify-center w-full">
              <div
                className="inline-flex duration-300 transition-all flex-col hover:scale-105 items-center mb-10 p-2 hover:bg-purp-light rounded-2xl cursor-pointer"
                onClick={() => setHowtoPlay(true)}
              >
                <FaQuestion className=" mb-1" size={20} />
                <div>How to Play</div>
              </div>
            </div>
            <div className="flex mb-10">
              <div
                className={`flex-1 p-4 m-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedEra === "2015-2024"
                    ? "bg-purp-light text-plat scale-105"
                    : "bg-comp-black hover:bg-black-hover"
                }`}
                onClick={() => setSelectedEra("2015-2024")}
              >
                <h3 className="text-xl font-bold mb-2">2015 - 2024</h3>
                <p className="text-sm">Modern Blockbusters</p>
              </div>
              <div
                className={`flex-1 p-4 m-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedEra === "2000-2015"
                    ? "bg-purp-light text-plat scale-105"
                    : "bg-comp-black hover:bg-black-hover"
                }`}
                onClick={() => setSelectedEra("2000-2015")}
              >
                <h3 className="text-xl font-bold mb-2">2000-2015</h3>
                <p className="text-sm">Millennium Hits</p>
              </div>
              <div
                className={`flex-1 p-4 m-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedEra === "1985-2000"
                    ? "bg-purp-light text-plat scale-105"
                    : "bg-comp-black hover:bg-black-hover"
                }`}
                onClick={() => setSelectedEra("1985-2000")}
              >
                <h3 className="text-xl font-bold mb-2">1985-2000</h3>
                <p className="text-sm">Classic Gems</p>
              </div>
            </div>
            <div className="flex justify-center w-full">
              {selectedEra !== "" && (
                <div
                  className="inline-flex items-center mb-10 p-2 duration-300 transition-all hover:bg-purp-light rounded-full hover:scale-105 cursor-pointer"
                  onClick={handleStartGame}
                >
                  <FaPlay className="mr-2" />
                  <div>Play</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <MoviedleGameScreen movie={movie} selectedEra={selectedEra} />
        )}
      </div>
      {HowtoPlay && (
        <div className=" bg-yt-black bg-opacity-70 fixed top-0 left-0 flex w-svw h-svh items-center justify-center z-50">
          <HowtoPlayBox setHowtoPlay={setHowtoPlay} />
        </div>
      )}
      <div className="footer"> HELLO</div>
    </>
  );
}

export default MoviedleMenu;

function HowtoPlayBox({ setHowtoPlay }: Props) {
  return (
    <div className="mukta-regular space-y-4 text-left  p-10 rounded-2xl text-plat bg-comp-black">
      <h2 className="text-xl font-bold">How to Play:</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>A new movie is selected daily at 12 AM Eastern Time.</li>
        <li>You have 10 attempts to guess the correct movie.</li>
        <li>
          With each guess, more cast members are revealed from the bottom and
          the movie poster gets less blurry.
        </li>
        <li>Try to identify the movie with as few guesses as possible!</li>
      </ul>
      <div className="pt-2">
        <button
          onClick={() => setHowtoPlay(false)}
          className="bg-purp hover:bg-purp-light text-plat font-bold py-2 px-4 rounded"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
}

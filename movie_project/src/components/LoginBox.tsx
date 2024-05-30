import axios from "axios";
import { FormEvent, useState, useContext } from "react";
import { LoginContext } from "../userContext";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../setAuthToken";
import ErrorMsg from "./ErrorMsg";

interface Props {
  onFlip: () => void;
}

function LoginBox({ onFlip }: Props) {
  const { updateUser } = useContext(LoginContext);
  const [userLogin, updateUserLogin] = useState({
    login: "",
    password: "",
  });
  const [errorMessage, terrorMessage] = useState(false);
  const [errMsg, setErrMsg] = useState("Enter the information");
  const navigate = useNavigate();
  const submitHandler = async (event: FormEvent) => {
    event.preventDefault();
    try {
      console.log("Inside the login submit handler");
      setAuthToken(localStorage.getItem("accessToken"));
      const response = await axios.post("/login", {
        login: userLogin.login,
        password: userLogin.password,
      }); // SENDING LOGIN INFORMATION TO THE SERVER TO CHECK IF -THE USER EXISTS
      // console.log(response);
      console.log("Re-Logged In");
      updateUser(userLogin.login);
      navigate("/HomePage");

      console.log(response);
    } catch (error: any) {
      console.log("Access Token is not valid");
      //console.log(error.respons || error); //DISPLAYING THE ERROR

      if (error.response && error.response.status === 403) {
        console.log(
          "Token is Expired - Trying to reach endpoint to refresh access token" //if access token is not valid, we check to see if the refresh token sent in the cookie is the same one as in the db.
        );
        try {
          axios.get("/refresh_token").then((response) => {
            localStorage.setItem("accessToken", response.data.accessToken);
            setAuthToken(localStorage.getItem("accessToken"));
            console.log("Successfully generated new access token");
            updateUser(userLogin.login);
            navigate("/HomePage");
          });
        } catch (error) {
          console.log("Invalid Credentials");
        }
      } else if (error.response && error.response.status === 404) {
        setErrMsg("Incorrect Email or Password");
        terrorMessage(true);
      } else if (error.response && error.response.status === 401) {
        setErrMsg("Incorrect Password");
        terrorMessage(true);
      }
    }
  };
  return (
    <>
      <div className="flex items-end justify-center h-screen bg-transparent">
        <div className="relative z-0 w-full max-w-xs shadow-sm">
          <form
            onSubmit={submitHandler}
            action=""
            className="bg-transparent shadow-xl rounded-md px-10 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="email"
              >
                Email
              </label>
              <input
                onChange={(event) =>
                  updateUserLogin({ ...userLogin, login: event.target.value })
                }
                value={userLogin.login}
                type="email"
                className="appearance-none rounded-sm py-2 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                placeholder="Email"
              ></input>
            </div>
            <div className="mb-3">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="password"
              >
                Password
              </label>
              <input
                onChange={(event) =>
                  updateUserLogin({
                    ...userLogin,
                    password: event.target.value,
                  })
                }
                value={userLogin.password}
                type="password"
                className="appearance-none rounded-sm py-2 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                placeholder="Enter Your Password"
              ></input>
            </div>
            {errorMessage && <ErrorMsg msg={errMsg} />}
            <div className="flex items-center justify-between mb-6">
              <button
                type="submit"
                className="bg-transparent px-4 py-2 rounded-sm shadow text-plat font-bold hover:bg-plat hover:text-yt-black hover:rounded-lg transition-all"
              >
                Sign In
              </button>
              <button type="button" className="text-plat hover:underline ">
                Forgot Password?
              </button>
            </div>
            <hr className="mb-6 border-gray-500"></hr>
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={onFlip}
                className="bg-transparent px-4 py-2 rounded-lg text-plat font-bold hover:bg-plat hover:text-yt-black transition-all"
              >
                Create new account
              </button>
            </div>
            <div className="flex justify-center ">
              <button
                type="button"
                onClick={() => {
                  navigate("/HomePage");
                }}
                className="bg-transparent px-4 py-2 rounded-lg text-plat font-bold hover:bg-plat hover:text-yt-black transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginBox;

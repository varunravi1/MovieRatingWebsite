import { set, z } from "zod";
import { FormEvent, useState, useContext } from "react";
import ErrorMsg from "./ErrorMsg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../userContext";
import { v4 as uuidv4 } from "uuid";
interface Props {
  onFlip: () => void;
}
function CreateAccountBox({ onFlip }: Props) {
  const { updateUser } = useContext(LoginContext);
  const navigate = useNavigate();
  const UserSchema = z
    .object({
      username: z.string().min(6),
      email: z.string().email(),
      dob: z.number().gt(6),
      password: z.string().min(8),
      confirmpassword: z.string().min(8),
    })
    .refine((data) => data.password === data.confirmpassword, {
      //   message: "Passwords should match",
    });
  const [errorMessage, terrorMessage] = useState(false);
  //type user = z.infer<typeof UserSchema>;
  const [errMsg, setErrMsg] = useState("Enter the information"); // Include error message in state
  const [userData, setuserData] = useState({
    username: "",
    email: "",
    dob: "",
    password: "",
    confirmpassword: "",
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const age = userData.dob ? parseInt(userData.dob) : null;
    const result = UserSchema.safeParse({ ...userData, dob: age });
    console.log(result);
    if (result.success) {
      terrorMessage(false);
      //SEND USER INFORMATION TO DATABSE
      try {
        const check = await axios.post("/check_email", {
          username: userData.username,
          email: userData.email,
        });
        console.log(check);
        let deviceId = localStorage.getItem("deviceId");

        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem("deviceId", deviceId as string);
        }
        const response = await axios.post("/register", {
          username: userData.username,
          email: userData.email,
          age: Number(userData.dob),
          password: userData.password,
          deviceId: deviceId,
        });

        // const response = await axios.post("/login", {
        //   login: userData.email,
        //   password: userData.password,
        // });

        // console.log(response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
        updateUser(userData.email);
        navigate("/");
        //console.log(response);
        //print response to server
      } catch (error) {
        setErrMsg("Username / Email Already Exists");
        terrorMessage(true);
        console.log(error); //log if error
      }

      //.......
    } else {
      if (userData.username == "" || userData.username.length < 6) {
        setErrMsg("Enter a username more than 6 letters");
      } else if (userData.password != userData.confirmpassword) {
        setErrMsg("Passwords don't match");
        setuserData({
          ...userData,
          password: "",
          confirmpassword: "",
        });
      } else if (userData.password.length < 8) {
        setErrMsg("Password must be more than 8 characters");
        setuserData({
          ...userData,
          password: "",
          confirmpassword: "",
        });
      } else if (userData.dob == "") {
        setErrMsg("Please Enter Age Above 6");
      } else {
        setErrMsg("Invalid Email");
        setuserData({
          username: "",
          email: "",
          dob: "",
          password: "",
          confirmpassword: "",
        });
      }
      terrorMessage(true);
      //MAKE PERSON RE-ENTER DATA
    }
  };
  return (
    <>
      <div className="flex items-center justify-center h-screen bg-transparent mt-20">
        <div className="relative z-0 w-full max-w-xs shadow-sm">
          <form
            onSubmit={handleSubmit}
            action=""
            className="bg-comp-black shadow-xl rounded-md px-10 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="ca-username"
              >
                Enter a Username
              </label>
              <input
                type="string"
                value={userData.username}
                onChange={(event) => {
                  setuserData({
                    ...userData,
                    username: event.target.value,
                  });
                }}
                className="appearance-none rounded-sm py-2 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ca-username"
                placeholder="Enter a Username"
              ></input>
            </div>
            <div className="mb-4">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="ca-email"
              >
                Enter an Email
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(event) => {
                  setuserData({
                    ...userData,
                    email: event.target.value,
                  });
                }}
                className="appearance-none rounded-sm py-2 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ca-email"
                placeholder="Enter An Email"
              ></input>
            </div>
            <div className="mb-4">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="DOB"
              >
                Age
              </label>
              <input
                value={userData.dob}
                onChange={(event) => {
                  setuserData({
                    ...userData,
                    dob: event.target.value,
                  });
                }}
                type="number"
                className="appearance-none rounded-sm py-2 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="DOB"
                placeholder=""
              ></input>
            </div>
            <div className="mb-4">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="ca-password"
              >
                Create a Password
              </label>
              <input
                value={userData.password}
                onChange={(event) => {
                  setuserData({
                    ...userData,
                    password: event.target.value,
                  });
                }}
                type="password"
                className="appearance-none rounded-sm py-2 pb-3 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ca-password"
                placeholder="Enter Your Password"
              ></input>
            </div>
            <div className="mb-2">
              <label
                className="block text-plat text-sm font-bold mb-2 tracking-[1px]"
                htmlFor="repassword"
              >
                Re-enter Your Password
              </label>
              <input
                value={userData.confirmpassword}
                onChange={(event) => {
                  setuserData({
                    ...userData,
                    confirmpassword: event.target.value,
                  });
                }}
                type="password"
                className="appearance-none rounded-sm py-2 pb-3 shadow px-3 w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="repassword"
                placeholder="Enter Your Password"
              ></input>
            </div>
            {errorMessage && <ErrorMsg msg={errMsg} />}
            <hr className="mb-6 border-gray-500"></hr>
            <div className="flex justify-center mb-6">
              <button
                type="submit"
                className="bg-transparent px-4 py-2 rounded-lg text-plat font-bold hover:bg-plat hover:text-yt-black transition-all font-sans"
              >
                Create new account
              </button>
            </div>
            <div className="flex justify-center ">
              <button
                type="button"
                onClick={onFlip}
                className="bg-transparent px-4 py-2 rounded-lg text-plat font-bold hover:bg-plat hover:text-yt-black transition-all font-sans"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateAccountBox;

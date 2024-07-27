import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import axios from "axios";
import { setAuthToken } from "./setAuthToken";

interface children {
  children: ReactNode;
}
interface LoginContextType {
  user: string | null;
  updateUser: Dispatch<SetStateAction<string | null>>;
  isAuthLoading: boolean;
}
export const LoginContext = createContext<LoginContextType>({
  user: null,
  updateUser: () => {},
  isAuthLoading: false,
});

function UserContext({ children }: children) {
  //   const navigate = useNavigate();
  const [user, updateUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  useEffect(() => {
    setAuthToken(localStorage.getItem("accessToken"));
    console.log("UserContext useeffect is running rn");
    providerFunc();
    const interval = setInterval(async () => {
      setAuthToken(localStorage.getItem("accessToken"));
      console.log("UserContext useeffect is running rn");
      console.log("User" + user);
      const timeLeft = await axios.get("/time_left");
      console.log(timeLeft.data);
      if (timeLeft.data < 5) {
        providerFunc();
      }
    }, 450000);
    return () => {
      clearInterval(interval);
      setIsAuthLoading(false);
    };
  }, []);

  const providerFunc = async () => {
    try {
      console.log("THIS IS THE RESPONSE FROM THE AUTHENTICATION ENDPOINT");
      setAuthToken(localStorage.getItem("accessToken"));
      const response = await axios.get("/user");
      updateUser(response.data.userAuthentication);
      console.log("This is the user");
      console.log(response.data.userAuthentication);
      setIsAuthLoading(false);
    } catch (error: any) {
      console.log("Access Token is not valid");
      //console.log(error.respons || error); //DISPLAYING THE ERROR

      if (error.response && error.response.status === 403) {
        console.log(
          "Token is Expired - Trying to create a new one with refresh token"
        );
        try {
          const response = await axios.get("/refresh_token");
          localStorage.setItem("accessToken", response.data.accessToken);
          setAuthToken(localStorage.getItem("accessToken"));
          console.log("Successfully generated new access token");
          console.log(response.data.user[0].email);
          // console.log(response.data.user.email);

          updateUser(response.data.user[0].email);
          // navigate("/HomePage");
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("No user");
      }
      setIsAuthLoading(false);
    }
  };
  return (
    <LoginContext.Provider value={{ user, updateUser, isAuthLoading }}>
      {children}
    </LoginContext.Provider>
  );
}

export default UserContext;

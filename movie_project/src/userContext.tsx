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
}
export const LoginContext = createContext<LoginContextType>({
  user: null,
  updateUser: () => {},
});

function UserContext({ children }: children) {
  //   const navigate = useNavigate();
  const [user, updateUser] = useState<string | null>(null);
  useEffect(() => {
    console.log("UserContext useeffect is running rn");
    console.log(user);
    setAuthToken(localStorage.getItem("accessToken"));
    if (user == null) {
      axios
        .get("/user")
        .then((response) => {
          console.log("THIS IS THE RESPONSE FROM THE AUTHENTICATION ENDPOINT");
          //   console.log(response.data.user.email);
          updateUser(response.data.user[0].email);

          console.log(response);
          console.log(user);
          //   navigate("/HomePage");
        })
        .catch((error: any) => {
          console.log("Access Token is not valid");
          //console.log(error.respons || error); //DISPLAYING THE ERROR

          if (error.response && error.response.status === 403) {
            console.log(
              "Token is Expired - Trying to create a new one with refresh token"
            );
            try {
              axios.get("/refresh_token").then((response) => {
                localStorage.setItem("accessToken", response.data.accessToken);
                setAuthToken(localStorage.getItem("accessToken"));
                console.log("Successfully generated new access token");
                console.log(typeof response.data.user[0].email);
                // console.log(response.data.user.email);

                updateUser(response.data.user[0].email);
                console.log(user + "HEllo");
                // navigate("/HomePage");
              });
            } catch (error) {
              console.log("error");
            }
          } else {
            console.log("confused");
          }
        });
    }
  }, []);
  return (
    <LoginContext.Provider value={{ user, updateUser }}>
      {children}
    </LoginContext.Provider>
  );
}

export default UserContext;

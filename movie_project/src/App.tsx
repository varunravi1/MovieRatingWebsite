import "./App.css";
// import LoginBox from "./components/LoginBox";
// import NavBar from "./components/NavBar.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import axios from "axios";
import UserContext from "./userContext";
import HomePage from "./components/HomePage";
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
let router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/HomePage",
    element: <HomePage />,
  },
]);
function App() {
  return (
    <>
      <UserContext>
        <RouterProvider
          router={router}
          fallbackElement={<p>Loading..</p>}
        ></RouterProvider>
        {/* <RouteHandler /> */}
      </UserContext>
    </>
  );
}

export default App;
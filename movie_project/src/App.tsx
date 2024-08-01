import "./App.css";
// import LoginBox from "./components/LoginBox";
// import NavBar from "./components/NavBar.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SearchPage from "./components/SearchPage";
import "./font.css";
import UserContext from "./userContext";
import HomePage from "./components/HomePage";
axios.defaults.baseURL = "http://localhost:8000/";
// axios.defaults.baseURL = "https://4r8z3n3m-8000.use.devtunnels.ms/";
import axios from "axios";
import MyLists from "./components/MyLists";
import MoviesPage from "./components/MoviesPage";
import Discover from "./components/Discover";
import ActorPage from "./components/ActorPage";
import { SearchProvider } from "./SearchContext";
import SearchResults from "./components/SearchResults";
import MoviedleMenu from "./components/MoviedleMenu";
import MoviedleGameScreen from "./components/MoviedleGameScreen";

axios.defaults.withCredentials = true;
let router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  // {
  //   path: "/HomePage",
  //   element: <HomePage />,
  // },
  {
    path: ":type/:id",
    element: <SearchPage />,
  },
  {
    path: "/actor/:id",
    element: <ActorPage />,
  },
  {
    path: "/MyList",
    element: <MyLists />,
  },
  {
    path: "/discover",
    element: <Discover />,
  },
  {
    path: "/searchresults",
    element: <SearchResults />,
  },
  {
    path: "/Moviedle",
    element: <MoviedleMenu />,
  },
]);
function App() {
  return (
    <>
      <UserContext>
        <SearchProvider>
          <RouterProvider
            router={router}
            fallbackElement={<p>Loading..</p>}
          ></RouterProvider>
        </SearchProvider>
      </UserContext>
    </>
  );
}

export default App;

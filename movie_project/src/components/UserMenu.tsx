import { useContext } from "react";
import UserContext from "../userContext";
import { LoginContext } from "../userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdFormatListBulleted } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
interface Props {
  onClick: () => void;
}
function UserMenu({ onClick }: Props) {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(LoginContext);
  return (
    <>
      <div className="w-80 h-80 rounded-3xl bg-dim-gray text-plat flex flex-col">
        <div className="pl-3 pt-3 h-10 rounded-xl flex justify-center items-center">
          <div>{user}</div>
        </div>
        <hr className="border-plat my-3 mx-2 rounded-xl"></hr>
        <div className="flex flex-col items-center justify-center">
          <div
            className=" flex items-center pl-6 roboto-regular w-full h-20 rounded-2xl hover:bg-black-hover cursor-pointer"
            onClick={() => navigate("/MyList")}
          >
            <MdFormatListBulleted size={30} className=" mr-3" />
            My Lists
          </div>
          <div className=" flex items-center pl-6 roboto-regular w-full h-20 rounded-2xl hover:bg-black-hover cursor-pointer">
            <IoIosSettings size={30} className=" mr-3" />
            Settings
          </div>
          <div
            className=" flex items-center pl-6 roboto-regular w-full h-20 rounded-2xl cursor-pointer hover:bg-black-hover"
            onClick={onClick}
          >
            <IoLogOutOutline size={30} className=" mr-3" />
            Logout
          </div>
        </div>
      </div>
    </>
  );
}

export default UserMenu;

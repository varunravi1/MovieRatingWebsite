import React from "react";

function SideBarLists() {
  return (
    <>
      <div className="bg-comp-black text-plat h-full flex flex-col space-y-6 py-4 px-4 roboto-bold rounded-3xl ">
        <div className="cursor-pointer hover:bg-black-hover rounded-lg py-2 pl-2">
          Movies
        </div>
        <div className="cursor-pointer hover:bg-black-hover rounded-lg py-2 pl-2">
          TV Shows
        </div>
        <div className="cursor-pointer hover:bg-black-hover rounded-lg py-2 pl-2">
          Books
        </div>
      </div>
    </>
  );
}

export default SideBarLists;

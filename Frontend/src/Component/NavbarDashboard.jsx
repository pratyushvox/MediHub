import React from "react";
import doctor from "../Images/doctor.png";

const Navbar = () => {
  return (
    <div className="flex justify-end items-center p-4 shadow-md bg-white">
      <img
        src={doctor} // Use the imported doctor image
        alt="Profile"
        className="w-10 h-10 rounded-full"
      />
    </div>
  );
};

export default Navbar;

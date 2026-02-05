import React from "react";

const Footer = () => {
  return (
    <footer className="w-full  text-center text-[12px] py-2 px-9 text-gray-500 border-t">
      © {new Date().getFullYear()}{" "}
      <span className="font-medium text-gray-700">
        Pendagon Technologies
      </span>
      . All rights reserved.
    </footer>
  );
};

export default Footer;

import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-500 border-t mt-8">
      © {new Date().getFullYear()}{" "}
      <span className="font-medium text-gray-700">
        Pendagon Technologies
      </span>
      . All rights reserved.
    </footer>
  );
};

export default Footer;

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTitle = (title) => {
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} - WeLearn Hub`;
  }, [location, title]);
};

export default usePageTitle;

import React, { useEffect, useState } from "react";

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center fixed top-0 left-0 backdrop-blur-3xl z-50">
      <LoadingText />
    </div>
  );
}

export default LoadingScreen;

function LoadingText() {
  const [loadingText, setLoadingText] = useState("Loading...");
  useEffect(() => {
    const interval = setInterval(() => {
      if (loadingText === "Loading...") {
        setLoadingText("Loading.  ".replace(/ /g, "\u00A0"));
      } else if (loadingText === "Loading.  ".replace(/ /g, "\u00A0")) {
        setLoadingText("Loading.. ".replace(/ /g, "\u00A0"));
      } else if (loadingText === "Loading.. ".replace(/ /g, "\u00A0")) {
        setLoadingText("Loading...");
      }
    }, 500);
    return () => clearInterval(interval);
  });
  return (
    <div className="font-mono font-bold text-black dark:text-[#ffffff50]">
      {loadingText}
    </div>
  );
}

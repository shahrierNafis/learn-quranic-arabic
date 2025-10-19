/* eslint-disable @next/next/no-img-element */
import React from "react";
import AtlosDialog from "./AtlosDialog";
import Italki from "./Italki";

export default function Ad() {
  return (
    <>
      <div className="flex justify-center flex-col items-center gap-2">
        {/* <AtlosDialog /> */}
        <Italki />
      </div>{" "}
    </>
  );
}

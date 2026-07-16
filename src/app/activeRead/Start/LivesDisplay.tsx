import React from "react";
import { Heart } from "lucide-react";

export default function LivesDisplay({ maxLives, lives }: { maxLives: number; lives: number }) {
  return (
    <div className="flex items-center justify-center gap-2 fixed bottom-4 right-4 z-999">
      {Array.from({ length: maxLives - lives })
        .map((_, i) => i + 1)
        .reverse()
        .map((l) => (
          <div key={"life " + l}>
            <Heart className="w-8 " />
          </div>
        ))}{" "}
      {Array.from({ length: lives })
        .map((_, i) => i + 1)
        .reverse()
        .map((l) => (
          <div key={"life " + l}>
            <Heart className="w-8 fill-red-500" />
          </div>
        ))}
    </div>
  );
}

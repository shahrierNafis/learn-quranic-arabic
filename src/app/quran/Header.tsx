import React, { useEffect, useState } from "react";
import useFont from "@/utils/useFont";
import VerseAudioBtn from "@/components/verseAudioBtn";
export default function Header({ surah }: { surah?: number }) {
  const [font] = useFont();
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (surah)
      fetch("https://api.quran.com/api/v4/chapters/" + surah)
        .then((r) => r.json())
        .then((r) =>
          setTitle(
            r.chapter.name_simple + ": " + r.chapter.translated_name.name
          )
        );

    return () => {};
  }, [surah]);

  return (
    <>
      <div className="text-2xl md:text-4xl text-center">
        {surah != 9 && (
          <div className={font?.className}>
            <div className="m-8">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          </div>
        )}
        <VerseAudioBtn verse_key={surah + ":0"} />
        <div className="m-4">{title}</div>
      </div>
    </>
  );
}

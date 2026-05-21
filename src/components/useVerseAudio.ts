import { useLocalStorage } from "@/stores/localStorage";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function useVerseAudio(verse_key?: string) {
  const [reciter_id] = useOnlineStorage(useShallow((s) => [s.reciter_id]));
  const [verseAudio, setVerseAudio] = useState<string>();
  const [audioVerse, setAudioVerse] = useLocalStorage(useShallow((s) => [s.audioVerse, s.setAudioVerse]));

  useEffect(() => {
    if (!verse_key) return;
    const [s, v] = verse_key?.split(":") || [];
    let url = `https://api.quran.com/api/v4/recitations/${reciter_id}/by_ayah/${verse_key}`;
    if (+v == 0) {
      //surah
      url = `https://api.quran.com/api/v4/chapter_recitations/${reciter_id}/${s}`;
      console.log(url);
      fetch(url)
        .then((res) => res.json())
        .then((r) => {
          setVerseAudio(r.audio_file.audio_url);
        });
      return;
    }
    fetch(url)
      .then((res) => res.json())
      .then((r) => {
        if ((r.audio_files[0].url as string).startsWith("//mirrors.")) {
          setVerseAudio(r.audio_files[0].url);
        } else setVerseAudio("https://audio.qurancdn.com/" + r.audio_files[0].url);
      });
    return () => {};
  }, [reciter_id, verse_key]);

  return {
    verseAudio,
    audioVerse,
    setAudioVerse,
  };
}

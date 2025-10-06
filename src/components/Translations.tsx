import { Skeleton } from "./ui/skeleton";
import getVerseTranslations from "@/utils/getVerseTranslations";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";

function Translations({ translations, index }: { translations?: Awaited<ReturnType<typeof getVerseTranslations>>; index?: string | null }) {
  const [translation_ids] = useOnlineStorage(useShallow((a) => [a.translation_ids]));

  const [translations2, setTranslations] = useState<Awaited<ReturnType<typeof getVerseTranslations>>>();
  useEffect(() => {
    if (translations) {
      setTranslations(translations);
      return;
    }
    // fetch translations if not provided
    const [surah, verse] = index?.split(":") ?? [];
    surah && verse && translation_ids && index && getVerseTranslations(translation_ids, surah, verse).then((r) => setTranslations(r));

    return () => {};
  }, [translation_ids, index, translations]);

  useEffect(() => {
    if (!index) setTranslations(undefined);

    return () => {};
  }, [index]);

  return (
    <>
      {translation_ids.length ? (
        <div className="text-sm md:text-xl">
          {index && translations2?.length ? (
            translation_ids
              .map((id) => translations2.filter((t) => t.id == +id)[0])
              .map((translation) => {
                return (
                  <>
                    <div key={index + translation?.id}>{translation?.text.replaceAll(/<sup.*?>.*?<\/sup>/g, "")}</div>
                    <div className="text-xs text-gray-500">
                      {"— "}
                      {translation?.name}
                    </div>
                  </>
                );
              })
          ) : (
            <>
              <Skeleton className="w-[64vw] h-[45px] rounded-full" />
            </>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default Translations;

import React, { useEffect, useState } from "react";
import { MultiSelect } from "@/components/MultiSelect";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
export default function SelectTranslation() {
  const [translation_ids, setTranslation_ids] = useOnlineStorage(
    useShallow((a) => [a.translation_ids, a.setTranslation_ids]),
  );

  const [translations, setTranslations] = useState<
    {
      id: number;
      name: string;
    }[]
  >();
  useEffect(() => {
    fetch("https://api.quran.com/api/v4/resources/translations")
      .then((res) => {
        return res.json();
      })
      .then(({ translations }) => setTranslations(translations));

    return () => {};
  }, []);

  return (
    <>
      <MultiSelect
        options={
          translations?.map((t) => {
            return { label: t.name, value: t.id + "" };
          }) ?? []
        }
        onChange={setTranslation_ids}
        selectedValues={translation_ids}
        placeholder="Select translations"
        label="Translations"
        // variant="default"
      />
    </>
  );
}

import React, { useEffect, useState } from "react";
import { MultiSelect } from "@/components/MultiSelect";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
export default function SelectTranslation() {
  const displayPreferences = useQuery(api.displayPreferences.get);
  const updateDisplayPreferences = useMutation(api.displayPreferences.update);
  const translation_ids = displayPreferences?.translation_ids ?? ["149"];
  const setTranslation_ids = (ids: string[]) => updateDisplayPreferences({ translation_ids: ids });

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

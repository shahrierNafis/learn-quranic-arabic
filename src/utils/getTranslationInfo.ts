import reportIssue from "./reportIssue";

let cache: {
  translations: {
    id: number;
    name: string;
    author_name: string;
    slug: string;
    language_name: string;
    translated_name: {
      name: string;
      language_name: string;
    };
  }[];
};
export default async function getTranslationInfo() {
  try {
    const { translations } = cache ?? (await (await fetch(`https://api.quran.com/api/v4/resources/translations`)).json());
    cache = { translations };
    return translations;
  } catch (error) {
    console.log(`Error while fetching the data: https://api.quran.com/api/v4/resources/translations \n`);
    if (!navigator.onLine)
      if (confirm("Failed to fetch translation info. Retry?")) return getTranslationInfo();
      else reportIssue();
    return [];
  }
}

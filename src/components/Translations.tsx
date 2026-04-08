import { Skeleton } from "./ui/skeleton";
import getVerseTranslations from "@/utils/getVerseTranslations";
import { useOnlineStorage } from "@/stores/onlineStorage";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Fetch footnote text by ID
async function getFootnote(footnoteId: string): Promise<string> {
  const res = await fetch(`https://api.qurancdn.com/api/qdc/foot_notes/${footnoteId}`);
  const data = await res.json();
  return data?.foot_note?.text ?? "No footnote available.";
}

// Component for a single footnote sup tag
function FootnoteRef({ footnoteId }: { footnoteId: string }) {
  const [text, setText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && text === null) {
      const content = await getFootnote(footnoteId);
      setText(content);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <sup className="cursor-pointer text-blue-500 hover:text-blue-700 font-semibold ml-0.5 select-none">§</sup>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Footnote</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground leading-relaxed">
          {text === null ? (
            <Skeleton className="h-16 w-full rounded" />
          ) : (
            // footnote text may itself contain HTML
            <span dangerouslySetInnerHTML={{ __html: text }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Renders raw translation HTML safely, converting special tags to React elements
function TranslationText({ html }: { html: string }) {
  // Replace <sup foot_note=ID>LABEL</sup> and <span class="h">TEXT</span>
  // with placeholder tokens, then split and map to React elements.
  const parts: React.ReactNode[] = [];

  // Use a temporary DOM parser to walk nodes
  const template = document.createElement("div");
  template.innerHTML = html;

  let keyCounter = 0;
  const walk = (node: ChildNode): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes).map((c) => walk(c));

      if (tag === "sup") {
        const footnoteId = el.getAttribute("foot_note");
        if (footnoteId) {
          return <FootnoteRef key={keyCounter++} footnoteId={footnoteId} />;
        }
        return <sup key={keyCounter++}>{children}</sup>;
      }

      if (tag === "span" && el.classList.contains("h")) {
        return (
          <span key={keyCounter++} className="text-red-800 dark:text-red-800/60 rounded px-0.5">
            {children}
          </span>
        );
      }

      // Fallback: render other elements as spans
      return <span key={keyCounter++}>{children}</span>;
    }
    return null;
  };

  template.childNodes.forEach((node) => parts.push(walk(node)));
  return <>{parts}</>;
}

function Translations({
  translations,
  index,
}: {
  translations?: Awaited<ReturnType<typeof getVerseTranslations>>;
  index?: string | null;
}) {
  const [translation_ids] = useOnlineStorage(useShallow((a) => [a.translation_ids]));
  const [translations2, setTranslations] = useState<Awaited<ReturnType<typeof getVerseTranslations>>>();

  useEffect(() => {
    if (translations) {
      setTranslations(translations);
      return;
    }
    const [surah, verse] = index?.split(":") ?? [];
    surah &&
      verse &&
      translation_ids &&
      index &&
      getVerseTranslations(translation_ids, surah, verse).then((r) => setTranslations(r));
  }, [translation_ids, index, translations]);

  useEffect(() => {
    if (!index) setTranslations(undefined);
  }, [index]);

  return (
    <>
      {translation_ids.length ? (
        <div className="text-sm md:text-xl">
          {index && translations2?.length ? (
            translation_ids
              .map((id) => translations2.filter((t) => t.id == +id)[0])
              .map((translation) => (
                <div key={index + translation?.id}>
                  <div className="leading-relaxed">
                    {translation?.text ? <TranslationText html={translation.text} /> : null}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {"— "}
                    {translation?.name}
                  </div>
                </div>
              ))
          ) : (
            <Skeleton className="w-[64vw] h-[45px] rounded-full" />
          )}
        </div>
      ) : null}
    </>
  );
}

export default Translations;

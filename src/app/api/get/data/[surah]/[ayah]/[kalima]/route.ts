import getWordData from "@/utils/getWordData";

export async function GET(
  request: Request,
  props: { params: Promise<{ surah: number; ayah: number; kalima: number }> }
) {
  const params = await props.params;

  const {
    surah,
    ayah,
    kalima
  } = params;

  return Response.json(await getWordData(surah, ayah, kalima));
}

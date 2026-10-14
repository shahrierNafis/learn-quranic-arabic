import getVerseData from "@/utils/getVerseData";

export async function GET(
  request: Request,
  props: { params: Promise<{ surah: number; ayah: number }> }
) {
  const params = await props.params;

  const {
    surah,
    ayah
  } = params;

  return Response.json(await getVerseData(surah, ayah));
}

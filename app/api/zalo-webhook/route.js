const GAS_URL = process.env.GAS_WEBHOOK_URL;
const OA_ID   = process.env.ZALO_OA_ID;

// GET: QR scan → log click → redirect thẳng vào Zalo OA
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src");

  // Log click bất đồng bộ
  if (src && GAS_URL) {
    fetch(GAS_URL + "?click=1&src=" + src).catch(() => {});
  }

  // Redirect thẳng → Zalo app mở luôn
  return Response.redirect("https://zalo.me/" + OA_ID, 302);
}

// POST: nhận event từ Zalo → forward về GAS ghi Sheet
export async function POST(request) {
  try {
    const body = await request.json();
    if (GAS_URL) {
      fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).catch(() => {});
    }
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "ok" });
  }
}

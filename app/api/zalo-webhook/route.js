const GAS_URL = process.env.GAS_WEBHOOK_URL;

export async function GET() {
  return Response.json({ 
    status: "ok", 
    service: "BIDV Ha Dong Zalo Webhook" 
  });
}

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

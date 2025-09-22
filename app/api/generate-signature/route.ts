import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    const { secret, payload } = await request.json();

    if (!secret || !payload) {
      return Response.json(
        { error: "Secret and payload are required" },
        { status: 400 },
      );
    }

    // Generate HMAC SHA256 signature
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return Response.json({ signature });
  } catch (error) {
    console.error("Error generating signature:", error);
    return Response.json(
      { error: "Failed to generate signature" },
      { status: 500 },
    );
  }
}

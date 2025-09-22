import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const providedSignature = request.headers.get("x-signature");
    const payload = await request.text();

    // Use a default secret for testing (in production, this would come from env)
    const secret = "your-secret-key";

    if (!providedSignature) {
      return Response.json(
        { valid: false, error: "No signature provided" },
        { status: 400 },
      );
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Compare signatures using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedSignature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );

    return Response.json({
      valid: isValid,
      expectedSignature,
      providedSignature,
    });
  } catch (error) {
    console.error("Error verifying signature:", error);
    return Response.json(
      { valid: false, error: "Failed to verify signature" },
      { status: 500 },
    );
  }
}

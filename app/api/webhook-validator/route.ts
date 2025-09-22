import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    // This simulates the Vercel webhook validation pattern but with SHA256
    const INTEGRATION_SECRET = "your-secret-key"; // In production: process.env.INTEGRATION_SECRET

    if (!INTEGRATION_SECRET) {
      return Response.json(
        {
          code: "missing_secret",
          error: "No integration secret found",
        },
        { status: 500 },
      );
    }

    const providedSignature = request.headers.get("x-signature");
    const rawBody = await request.text();
    const rawBodyBuffer = Buffer.from(rawBody, "utf-8");

    if (!providedSignature) {
      return Response.json(
        {
          code: "missing_signature",
          error: "No signature header found",
        },
        { status: 400 },
      );
    }

    // Generate expected signature using HMAC SHA256 (instead of SHA1 like in Vercel docs)
    const expectedSignature = sha256(rawBodyBuffer, INTEGRATION_SECRET);

    // Use timing-safe comparison to prevent timing attacks
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(providedSignature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
    } catch (error) {
      // If signatures have different lengths, timingSafeEqual will throw
      isValid = false;
    }

    if (!isValid) {
      return Response.json(
        {
          code: "invalid_signature",
          error: "Signature didn't match",
          debug: {
            expected: expectedSignature,
            provided: providedSignature,
          },
        },
        { status: 401 },
      );
    }

    // Parse and process the validated payload
    const json = JSON.parse(rawBodyBuffer.toString("utf-8"));

    // Simulate processing different webhook types
    let message = "Webhook request validated successfully";
    switch (json.type) {
      case "project.created":
        message = `Project "${json.data?.name || "unknown"}" created successfully`;
        break;
      case "deployment.created":
        message = `Deployment created successfully`;
        break;
      default:
        message = `Webhook type "${json.type}" processed successfully`;
    }

    return Response.json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook validation error:", error);
    return Response.json(
      {
        code: "validation_error",
        error: "Failed to validate webhook",
      },
      { status: 500 },
    );
  }
}

function sha256(data: Buffer, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

"use client";

import { Check, Copy, FileText, Key, Shield } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function HMACSignatureTester() {
  const [secret, setSecret] = useState("your-secret-key");
  const [payload, setPayload] = useState(
    '{"type": "project.created", "data": {"id": "123", "name": "test-project"}}',
  );
  const [signature, setSignature] = useState("");
  const [verificationSignature, setVerificationSignature] = useState("");
  const [verificationResult, setVerificationResult] = useState<
    "valid" | "invalid" | null
  >(null);
  const [copied, setCopied] = useState(false);

  const generateSignature = async () => {
    try {
      const response = await fetch("/api/generate-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret, payload }),
      });

      const data = await response.json();
      setSignature(data.signature);
    } catch (error) {
      console.error("Error generating signature:", error);
    }
  };

  const verifySignature = async () => {
    try {
      const response = await fetch("/api/verify-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": verificationSignature,
        },
        body: payload,
      });

      const data = await response.json();
      setVerificationResult(data.valid ? "valid" : "invalid");
    } catch (error) {
      console.error("Error verifying signature:", error);
      setVerificationResult("invalid");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateWebhook = async () => {
    try {
      const response = await fetch("/api/webhook-validator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": signature,
        },
        body: payload,
      });

      const data = await response.json();
      alert(`Webhook simulation result: ${data.message || data.error}`);
    } catch (error) {
      console.error("Error simulating webhook:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">HMAC SHA256 Signature Tester</h1>
          </div>
          <p className="text-muted-foreground">
            Test HMAC SHA256 signature generation and verification for webhook
            security
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Signature Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Generate Signature
              </CardTitle>
              <CardDescription>
                Create an HMAC SHA256 signature for your payload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret">Secret Key</Label>
                <Input
                  id="secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your secret key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payload">Payload (JSON)</Label>
                <Textarea
                  id="payload"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Enter your JSON payload"
                  rows={4}
                />
              </div>

              <Button onClick={generateSignature} className="w-full">
                Generate Signature
              </Button>

              {signature && (
                <div className="space-y-2">
                  <Label>Generated Signature</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={signature}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(signature)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verify Signature
              </CardTitle>
              <CardDescription>
                Verify an HMAC SHA256 signature against a payload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-signature">
                  Signature to Verify
                </Label>
                <Input
                  id="verification-signature"
                  value={verificationSignature}
                  onChange={(e) => setVerificationSignature(e.target.value)}
                  placeholder="Enter signature to verify"
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={verifySignature} className="w-full">
                Verify Signature
              </Button>

              {verificationResult && (
                <div className="flex items-center justify-center">
                  <Badge
                    variant={
                      verificationResult === "valid" ? "default" : "destructive"
                    }
                    className="text-sm"
                  >
                    {verificationResult === "valid"
                      ? "✓ Valid Signature"
                      : "✗ Invalid Signature"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Webhook Simulation */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Simulation</CardTitle>
            <CardDescription>
              Simulate a complete webhook request with signature validation
              (like Vercel's webhook system)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Configuration:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Secret:</strong>{" "}
                    <code className="bg-background px-1 rounded">{secret}</code>
                  </p>
                  <p>
                    <strong>Signature:</strong>{" "}
                    <code className="bg-background px-1 rounded">
                      {signature || "Generate signature first"}
                    </code>
                  </p>
                </div>
              </div>

              <Button
                onClick={simulateWebhook}
                disabled={!signature}
                className="w-full"
              >
                Simulate Webhook Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Generate</h4>
                <p className="text-sm text-muted-foreground">
                  Create an HMAC SHA256 hash using your secret key and payload
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">2. Send</h4>
                <p className="text-sm text-muted-foreground">
                  Include the signature in the <code>x-signature</code> header
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">3. Verify</h4>
                <p className="text-sm text-muted-foreground">
                  Server recreates the signature and compares for validation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

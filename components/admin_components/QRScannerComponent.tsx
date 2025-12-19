"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ScanResult {
  success: boolean;
  message: string;
  sessionTitle?: string;
  points?: number;
  error?: string;
}

export default function QRScannerComponent() {
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleManualInput = async () => {
    if (!qrData.trim()) {
      toast.error("Please paste the QR code data");
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      // Parse the QR data
      const parsedData = JSON.parse(qrData);
      
      if (!parsedData.token || !parsedData.sessionId || parsedData.type !== "attendance") {
        toast.error("Invalid QR code data");
        setLoading(false);
        return;
      }

      // Send to verify API
      const response = await fetch("/api/admin/attendance/verify-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: parsedData.token,
          sessionId: parsedData.sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: data.message,
          sessionTitle: data.sessionTitle,
          points: data.points,
        });
        toast.success("Attendance marked successfully!");
        setQrData("");
      } else {
        setScanResult({
          success: false,
          message: data.error,
          error: data.error,
        });
        toast.error(data.error || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setScanResult({
        success: false,
        message: "Invalid QR code format or network error",
        error: "Invalid QR code format or network error",
      });
      toast.error("Failed to process QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            Scan QR Code for Attendance
          </CardTitle>
          <CardDescription>
            Scan the QR code displayed by your instructor to mark your attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              QR Code Data (Manual Input)
            </label>
            <Textarea
              placeholder='Paste QR code data here (e.g., {"token":"...","sessionId":"...","type":"attendance"})'
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Note: In a production environment, you would use a QR scanner library like react-qr-scanner
            </p>
          </div>

          <Button
            onClick={handleManualInput}
            disabled={loading || !qrData.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Mark Attendance
              </>
            )}
          </Button>

          {/* Scan Result */}
          {scanResult && (
            <div
              className={`p-4 rounded-lg border-2 ${
                scanResult.success
                  ? "bg-green-50 border-green-500 dark:bg-green-950"
                  : "bg-red-50 border-red-500 dark:bg-red-950"
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p
                    className={`font-medium ${
                      scanResult.success
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.success && (
                    <div className="space-y-1">
                      {scanResult.sessionTitle && (
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Session: <strong>{scanResult.sessionTitle}</strong>
                        </p>
                      )}
                      {scanResult.points && (
                        <Badge variant="secondary" className="bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100">
                          +{scanResult.points} points earned
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Wait for your instructor to display the QR code</li>
              <li>Scan the QR code using your camera (future feature)</li>
              <li>Or manually copy and paste the QR data above</li>
              <li>Click &quot;Mark Attendance&quot; to submit</li>
              <li>You&apos;ll receive confirmation and points instantly</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

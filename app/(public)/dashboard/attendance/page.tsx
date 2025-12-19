"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
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
import { QrCode, CheckCircle, XCircle, Camera, CameraOff } from "lucide-react";
import AttendanceHistory from "./_components/attendance-history";

interface ScanResult {
  success: boolean;
  message: string;
  sessionTitle?: string;
  points?: number;
  error?: string;
}

export default function QRScannerComponent() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setCameraError("");
    setScanResult(null);
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        async (decodedText) => {
          // QR Code scanned successfully
          await handleScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // QR Code scan error - can be ignored (happens frequently)
        }
      );
    } catch (error: any) {
      console.error("Error starting camera:", error);
      setCameraError(
        error?.message || "Failed to access camera. Please ensure camera permissions are granted."
      );
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        qrCodeRef.current = null;
      } catch (error) {
        console.error("Error stopping camera:", error);
      }
    }
    setScanning(false);
  };

  const handleScan = async (decodedText: string) => {
    try {
      // Parse the QR data
      const parsedData = JSON.parse(decodedText);

      if (
        !parsedData.token ||
        !parsedData.sessionId ||
        parsedData.type !== "attendance"
      ) {
        toast.error("Invalid QR code");
        setScanResult({
          success: false,
          message: "Invalid QR code format",
          error: "Invalid QR code format",
        });
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
          {/* Camera Container */}
          <div className="relative">
            <div
              id="qr-reader"
              className={`w-full ${scanning ? "block" : "hidden"}`}
            ></div>

            {!scanning && !scanResult && (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <Camera className="h-24 w-24 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Ready to Scan
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click the button below to start camera
                </p>
              </div>
            )}
          </div>

          {/* Camera Error */}
          {cameraError && (
            <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg dark:bg-red-950">
              <p className="text-sm text-red-900 dark:text-red-100">
                {cameraError}
              </p>
            </div>
          )}

          {/* Scanner Controls */}
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startScanning} className="flex-1" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Camera
              </Button>
            )}
          </div>

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
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
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
                  {!scanResult.success && (
                    <Button
                      onClick={() => {
                        setScanResult(null);
                        startScanning();
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Try Again
                    </Button>
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
              <li>Click &quot;Start Camera&quot; to activate your device camera</li>
              <li>Point your camera at the QR code</li>
              <li>The app will automatically scan and mark your attendance</li>
              <li>You&apos;ll receive confirmation and points instantly</li>
            </ol>
          </div>

          {/* Camera Permissions Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> This feature requires camera access. Please allow camera permissions when prompted by your browser.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <AttendanceHistory />
    </div>
  );
}

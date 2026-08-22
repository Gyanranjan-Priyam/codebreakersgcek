"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Search,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";

interface ScannedUser {
  id: string;
  name: string;
  email: string;
  cbUserId: string | null;
  registration: string | null;
  rollNumber: string | null;
  branch: string | null;
  profileImageKey: string | null;
  role: string | null;
}

interface ScanHistoryItem {
  id: string;
  user: ScannedUser;
  timestamp: Date;
  status: "success" | "already_marked";
  message: string;
}

interface StudentQRScannerProps {
  sessionId: string;
  sessionTitle: string;
  onScanSuccess?: () => void;
}

export default function StudentQRScanner({
  sessionId,
  sessionTitle,
  onScanSuccess,
}: StudentQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanned, setLastScanned] = useState<{
    user: ScannedUser;
    status: "success" | "already_marked";
    message: string;
    timestamp: Date;
  } | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState("");

  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTextRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

  const playSuccessSound = useCallback((type: "success" | "already" | "error") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        // High pleasant ding-ding
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.1); // D6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "already") {
        // Double soft beep
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
      } else {
        // Low error buzz
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  const processScannedCode = useCallback(async (scannedText: string) => {
    if (!sessionId) {
      toast.error("Please select an attendance session first");
      return;
    }

    // Cooldown check (prevent repeated scanning of the exact same code within 3 seconds)
    const now = Date.now();
    if (
      lastScannedTextRef.current === scannedText &&
      now - lastScannedTimeRef.current < 3000
    ) {
      return;
    }

    lastScannedTextRef.current = scannedText;
    lastScannedTimeRef.current = now;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/admin/attendance/scan-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          qrContent: scannedText,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        playSuccessSound("error");
        toast.error(data.error || "Failed to process QR code");
        return;
      }

      const scannedUser: ScannedUser = data.user;
      const isAlready = !!data.alreadyMarked;

      if (isAlready) {
        playSuccessSound("already");
        toast.info(data.message);
      } else {
        playSuccessSound("success");
        toast.success(data.message);
        onScanSuccess?.();
      }

      const historyItem: ScanHistoryItem = {
        id: `${scannedUser.id}-${Date.now()}`,
        user: scannedUser,
        timestamp: new Date(),
        status: isAlready ? "already_marked" : "success",
        message: data.message,
      };

      setLastScanned({
        user: scannedUser,
        status: isAlready ? "already_marked" : "success",
        message: data.message,
        timestamp: new Date(),
      });

      setScanHistory((prev) => [historyItem, ...prev.filter((i) => i.user.id !== scannedUser.id)]);
    } catch (error) {
      console.error("Error processing QR:", error);
      playSuccessSound("error");
      toast.error("Network or server error while marking attendance");
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, onScanSuccess, playSuccessSound]);

  const startCamera = async () => {
    setCameraError("");
    setIsScanning(true);

    // Wait for the container element to render in DOM
    setTimeout(async () => {
      try {
        const element = document.getElementById("admin-qr-reader");
        if (!element) {
          throw new Error("Scanner container not found in DOM");
        }

        const html5QrCode = new Html5Qrcode("admin-qr-reader");
        qrCodeRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            processScannedCode(decodedText);
          },
          () => {
            // Ignore scan parse frame misses
          }
        );
      } catch (err: any) {
        console.error("Error starting camera scanner:", err);
        setCameraError(
          err?.message || "Could not access camera. Please check browser permissions."
        );
        setIsScanning(false);
      }
    }, 100);
  };

  const stopCamera = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        qrCodeRef.current.clear();
        qrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(() => {}).finally(() => {
          qrCodeRef.current = null;
        });
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error("Please enter a User ID, Roll Number, or QR text");
      return;
    }
    processScannedCode(manualInput.trim());
    setManualInput("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredHistory = scanHistory.filter((item) => {
    if (!historySearch.trim()) return true;
    const query = historySearch.toLowerCase();
    return (
      item.user.name.toLowerCase().includes(query) ||
      item.user.cbUserId?.toLowerCase().includes(query) ||
      item.user.rollNumber?.toLowerCase().includes(query) ||
      item.user.registration?.toLowerCase().includes(query) ||
      item.user.branch?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Column: Live Camera & Manual Input */}
      <div className="space-y-6 lg:col-span-7">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Live Student QR Scanner
                </CardTitle>
                <CardDescription>
                  Scanning for session: <span className="font-semibold text-foreground">{sessionTitle}</span>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute audio beep" : "Unmute audio beep"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Viewfinder / Camera Area */}
            <div className="relative overflow-hidden rounded-xl border bg-black/5 dark:bg-black/40 min-h-[300px] flex flex-col items-center justify-center p-2">
              {isScanning ? (
                <div className="w-full flex flex-col items-center">
                  <div
                    id="admin-qr-reader"
                    className="w-full max-w-[360px] rounded-lg overflow-hidden border-2 border-primary/40 shadow-inner"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="font-medium text-sm">Processing student QR...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                    <QrCode className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-base">Camera is currently inactive</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Click below to turn on the camera and point it at the student&apos;s digital or printed QR code.
                    </p>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="mt-3 p-3 rounded-lg border border-destructive bg-destructive/10 text-destructive text-xs flex items-start gap-2 max-w-md">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>

            {/* Camera Control Buttons */}
            <div className="flex gap-2">
              {isScanning ? (
                <Button
                  variant="destructive"
                  onClick={stopCamera}
                  className="w-full"
                  size="lg"
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera Scanner
                </Button>
              ) : (
                <Button
                  onClick={startCamera}
                  disabled={!sessionId}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera Scanner
                </Button>
              )}
            </div>

            {/* Manual ID Input Fallback */}
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Manual Entry / Barcode Scanner Input
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  placeholder="Enter CB User ID (e.g. GCEK-CB-944870), Roll No., or profile URL..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  disabled={isProcessing || !sessionId}
                  className="font-mono text-xs"
                />
                <Button type="submit" disabled={isProcessing || !manualInput.trim() || !sessionId}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mark Present"
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Last Scanned Result & Live Scan Feed */}
      <div className="space-y-6 lg:col-span-5">
        {/* Last Scanned Result Card */}
        <Card className={lastScanned?.status === "success" ? "border-green-500/50 bg-green-50/20 dark:bg-green-950/10" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Latest Scan Result
              </span>
              {lastScanned && (
                <Badge
                  variant={lastScanned.status === "success" ? "default" : "secondary"}
                  className={lastScanned.status === "success" ? "bg-green-600 hover:bg-green-600" : ""}
                >
                  {lastScanned.status === "success" ? "Marked Present (+10 pts)" : "Already Present"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastScanned ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-xs">
                    {lastScanned.user.profileImageKey ? (
                      <AvatarImage
                        src={`https://codebreakers.t3.storage.dev/${lastScanned.user.profileImageKey}`}
                        alt={lastScanned.user.name}
                      />
                    ) : null}
                    <AvatarFallback className="font-bold bg-primary text-primary-foreground">
                      {getInitials(lastScanned.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base truncate">{lastScanned.user.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
                      {lastScanned.user.cbUserId && (
                        <span className="font-mono font-semibold text-primary">
                          {lastScanned.user.cbUserId}
                        </span>
                      )}
                      {lastScanned.user.branch && <span>• {lastScanned.user.branch}</span>}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roll / Reg:</span>
                    <span className="font-medium">
                      {lastScanned.user.rollNumber || lastScanned.user.registration || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scanned at:</span>
                    <span className="font-medium">
                      {format(lastScanned.timestamp, "hh:mm:ss a")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
                No student scanned yet in this session. Start the camera or enter a User ID to mark attendance.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scanner Session History */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Scanned This Session ({scanHistory.length})
              </CardTitle>
              {scanHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setScanHistory([]);
                    setLastScanned(null);
                  }}
                  className="h-7 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear List
                </Button>
              )}
            </div>
            {scanHistory.length > 5 && (
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter scanned students..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <Clock className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                {scanHistory.length === 0
                  ? "Scanned students will appear here in real-time."
                  : "No students match your filter."}
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8">
                        {item.user.profileImageKey ? (
                          <AvatarImage
                            src={`https://codebreakers.t3.storage.dev/${item.user.profileImageKey}`}
                            alt={item.user.name}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(item.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-xs truncate">{item.user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {item.user.cbUserId || item.user.rollNumber || item.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                      <Badge
                        variant={item.status === "success" ? "default" : "outline"}
                        className={`text-[10px] px-1.5 py-0 ${item.status === "success" ? "bg-green-600 text-white" : ""}`}
                      >
                        {item.status === "success" ? "Present (+10)" : "Already Present"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {format(item.timestamp, "hh:mm:ss a")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

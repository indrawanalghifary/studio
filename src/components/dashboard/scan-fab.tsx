'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Camera, Scan, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTransactionFromReceipt, ExtractTransactionFromReceiptOutput } from "@/ai/flows/extract-transaction-from-receipt";

interface ScanFabProps {
  setActiveTab: (tab: string) => void;
}

export function ScanFab({ setActiveTab }: ScanFabProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [openScanDialog, setOpenScanDialog] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (openScanDialog) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };
      getCameraPermission();

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [openScanDialog, toast]);

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await extractTransactionFromReceipt({ photoDataUri });
      
      // Dispatch custom event with the scanned data
      const event = new CustomEvent<ExtractTransactionFromReceiptOutput>('scanComplete', { detail: result });
      window.dispatchEvent(event);
      
      // Switch to the add transaction tab
      setActiveTab('add_transaction');

      setOpenScanDialog(false);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      toast({
        title: "Scan Failed",
        description: "Could not extract data from the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <Dialog open={openScanDialog} onOpenChange={setOpenScanDialog}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center"
            size="icon"
          >
            <Camera className="h-8 w-8" />
            <span className="sr-only">Scan Receipt</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
            <DialogDescription>
              Position your receipt within the frame and capture it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
                  <Alert variant="destructive" className="w-auto">
                    <Video className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCaptureAndAnalyze} disabled={!hasCameraPermission || isScanning} className="w-full">
              {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
              {isScanning ? "Analyzing..." : "Capture & Analyze"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Camera, Scan, Video, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTransactionFromReceipt, ExtractTransactionFromReceiptOutput } from "@/ai/flows/extract-transaction-from-receipt";
import { AddTransactionForm } from "./add-transaction-form";
import { AnimatePresence, motion } from "framer-motion";

export function TransactionFab() {
  const { toast } = useToast();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<'income' | 'expense' | 'scan' | null>(null);
  const [scanResult, setScanResult] = useState<ExtractTransactionFromReceiptOutput | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDialogContent(null);
      setScanResult(null); // Clear scan result when any dialog is closed
    }
  };

  const handleFabClick = (content: 'income' | 'expense' | 'scan') => {
    setDialogContent(content);
    setIsFabOpen(false);
  };
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Akses Kamera Ditolak',
          description: 'Mohon izinkan akses kamera di pengaturan browser Anda.',
        });
      }
    };

    if (dialogContent === 'scan') {
      getCameraPermission();
    }

    // Cleanup function to stop the camera stream
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [dialogContent, toast]);

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
      setScanResult(result);
      setDialogContent(result.type); 

    } catch (error) {
      console.error("Error analyzing receipt:", error);
      toast({
        title: "Pindai Gagal",
        description: "Tidak dapat mengekstrak data. Silakan coba lagi.",
        variant: "destructive",
      });
      setDialogContent(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                className="flex flex-col items-center gap-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                 <Button className="h-14 w-14 rounded-full shadow-lg" size="icon" onClick={() => handleFabClick('scan')}>
                  <Camera className="h-7 w-7" />
                </Button>
                <Button className="h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600" size="icon" onClick={() => handleFabClick('income')}>
                  <ArrowUp className="h-7 w-7" />
                </Button>
                <Button className="h-14 w-14 rounded-full shadow-lg bg-red-500 hover:bg-red-600" size="icon" onClick={() => handleFabClick('expense')}>
                  <ArrowDown className="h-7 w-7" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            className="h-16 w-16 rounded-full shadow-lg flex items-center justify-center"
            size="icon"
            onClick={() => setIsFabOpen(!isFabOpen)}
          >
            <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }}>
              <Plus className="h-8 w-8" />
            </motion.div>
          </Button>
      </div>

      <Dialog open={!!dialogContent} onOpenChange={onDialogOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          {dialogContent === 'scan' && (
            <>
              <DialogHeader>
                <DialogTitle>Pindai Struk</DialogTitle>
                <DialogDescription>Posisikan struk Anda dan ambil gambar untuk dianalisis.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="relative">
                  <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
                      <Alert variant="destructive" className="w-auto">
                        <Video className="h-4 w-4" />
                        <AlertTitle>Akses Kamera Diperlukan</AlertTitle>
                        <AlertDescription>Izinkan akses kamera untuk fitur ini.</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleCaptureAndAnalyze} disabled={!hasCameraPermission || isScanning} className="w-full">
                  {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
                  {isScanning ? "Menganalisis..." : "Ambil & Analisis"}
                </Button>
              </DialogFooter>
            </>
          )}

          {(dialogContent === 'income' || dialogContent === 'expense') && (
            <>
              <DialogHeader>
                <DialogTitle>Tambah {dialogContent === 'income' ? 'Pemasukan' : 'Pengeluaran'} Baru</DialogTitle>
                <DialogDescription>Isi detail di bawah ini untuk menambahkan catatan baru.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <AddTransactionForm 
                  transactionType={dialogContent}
                  onFormSubmit={() => setDialogContent(null)}
                  initialData={scanResult}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

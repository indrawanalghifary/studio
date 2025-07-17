'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Camera, Upload, ArrowRightLeft, Video, CircleUserRound, Scan, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { categories, incomeCategories, type Transaction } from "@/lib/data";
import { addTransaction } from "@/lib/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { extractTransactionFromReceipt } from "@/ai/flows/extract-transaction-from-receipt";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  category: z.string().min(1, { message: "Please select a category." }),
  date: z.date(),
  description: z.string().min(1, { message: "Description is required." }),
});

interface AddTransactionFormProps {
  onTransactionAdded: (transaction: Omit<Transaction, 'id'>) => void;
}

export function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  // Camera state
  const [openScanDialog, setOpenScanDialog] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      category: '',
      date: new Date(),
      description: '',
    },
  });

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
      form.setValue('amount', result.amount);
      form.setValue('description', result.description);
      form.setValue('date', new Date(result.date));
      form.setValue('type', result.type);
      if(result.type === 'income') {
        setTransactionType('income');
      } else {
        setTransactionType('expense');
      }
      // Check if category exists before setting it
      const availableCategories = result.type === 'expense' ? categories : incomeCategories;
      if (availableCategories.includes(result.category)) {
        form.setValue('category', result.category);
      } else {
        form.setValue('category', 'Other'); // Fallback to 'Other'
      }

      toast({
        title: "Scan Complete",
        description: "Form has been pre-filled with the receipt data.",
        variant: 'default',
        className: "bg-accent text-accent-foreground"
      });
      setOpenScanDialog(false);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      toast({
        title: "Scan Failed",
        description: "Could not extract data from the receipt. Please try again or fill the form manually.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const newTransaction = { ...values, createdAt: new Date() };
      await addTransaction(newTransaction);
      toast({
        title: "Transaction added",
        description: `Successfully added ${values.type} of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(values.amount)}.`,
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
      form.reset({ 
          type: transactionType,
          amount: 0,
          category: '',
          date: new Date(),
          description: '',
       });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Record a New Transaction</CardTitle>
        <CardDescription>Fill in the details below to add a new financial record.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={transactionType}
                      className="grid grid-cols-2"
                      onValueChange={(value: 'income' | 'expense') => {
                        if (value) {
                            field.onChange(value);
                            setTransactionType(value);
                            form.setValue('category', '');
                        }
                      }}
                    >
                      <ToggleGroupItem value="expense" aria-label="Toggle expense" className="data-[state=on]:bg-red-100 data-[state=on]:text-red-600">
                        Expense
                      </ToggleGroupItem>
                      <ToggleGroupItem value="income" aria-label="Toggle income" className="data-[state=on]:bg-green-100 data-[state=on]:text-green-600">
                        Income
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(transactionType === 'expense' ? categories : incomeCategories).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Coffee with a friend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Dialog open={openScanDialog} onOpenChange={setOpenScanDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    <Camera className="mr-2 h-4 w-4" /> Scan Receipt
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
                              <Video className="h-4 w-4"/>
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
              <Button type="button" variant="outline" className="w-full" disabled>
                <Upload className="mr-2 h-4 w-4" /> Upload File
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
              Add Transaction
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

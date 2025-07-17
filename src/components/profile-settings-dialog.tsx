'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { uploadProfilePicture } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface ProfileSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsDialog({ isOpen, onOpenChange }: ProfileSettingsDialogProps) {
  const [user, loadingUser] = useAuthState(auth);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      const photoURL = await uploadProfilePicture(selectedFile);
      await updateProfile(user, { photoURL });
      
      toast({
        title: 'Sukses',
        description: 'Foto profil Anda berhasil diperbarui.',
        variant: 'default',
        className: 'bg-accent text-accent-foreground',
      });
      onOpenChange(false); // Close dialog on success
      setPreviewUrl(null);
      setSelectedFile(null);

    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui foto profil. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const currentPhoto = previewUrl || user?.photoURL;
  const fallbackLetter = user?.email?.[0].toUpperCase() || 'U';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pengaturan Profil</DialogTitle>
          <DialogDescription>
            Perbarui foto profil Anda di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={currentPhoto || undefined} alt="Foto Profil" />
              <AvatarFallback className="text-5xl">{fallbackLetter}</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Pilih Foto
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={!selectedFile || isUploading || loadingUser}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

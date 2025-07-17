import { Wallet } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Wallet className="h-8 w-8" />
      <span className="text-2xl font-bold text-foreground">KeuanganKu</span>
    </div>
  );
}

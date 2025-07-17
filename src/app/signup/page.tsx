import { SignupForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
       <Card className="w-full max-w-sm shadow-2xl" style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Buat Akun</CardTitle>
          <CardDescription>Masukkan email Anda untuk membuat akun</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
        <CardFooter className="flex-col">
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

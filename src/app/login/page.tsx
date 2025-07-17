import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
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
          <CardTitle className="text-2xl font-bold">Selamat Datang Kembali!</CardTitle>
          <CardDescription>Masukkan email Anda untuk masuk ke akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex-col">
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

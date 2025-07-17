import { redirect } from 'next/navigation';

export default function Home() {
  // For this demo, we redirect to the login page.
  // In a real application, you would check for an active session.
  redirect('/login');
}

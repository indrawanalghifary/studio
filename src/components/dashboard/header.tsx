import { Logo } from "@/components/icons/logo";
import { UserNav } from "@/components/user-nav";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex-1">
        <Logo />
      </div>
      <UserNav />
    </header>
  );
}

import Authentication from "@/components/authentication";
import Navigation from "@/components/navigation";
import { ThemeController } from "@/components/theme-controller";
import HomeButton from "@/components/ui/home-button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex justify-between">
      <div className="flex gap-2">
        <HomeButton />
        <ThemeController />
      </div>
      <div className="flex gap-2 sm:flex-row-reverse">
        <Authentication />
        <Navigation />
      </div>
    </header>
  );
}

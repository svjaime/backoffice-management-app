import Navigation from "@/components/navigation";
import Authentication from "@/components/authentication";
import HomeButton from "./ui/home-button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex justify-between">
      <HomeButton />
      <div className="flex gap-2 sm:flex-row-reverse">
        <Authentication />
        <Navigation />
      </div>
    </header>
  );
}

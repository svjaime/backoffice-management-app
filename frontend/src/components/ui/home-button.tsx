"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";

export default function HomeButton() {
  const pathname = usePathname();

  return (
    <Button asChild size="icon">
      <Link
        href="/"
        aria-label="Home Page"
        onClick={(e) => {
          if (pathname === "/") {
            e.preventDefault(); // Prevent navigating away
          }
        }}
      >
        <Home />
      </Link>
    </Button>
  );
}

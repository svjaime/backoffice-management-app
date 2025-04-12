"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { Loader, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import en from "../../messages/en.json";

const navItems: {
  labelKey: keyof typeof en.Navigation;
  href: string;
}[] = [
  { labelKey: "dashboard", href: "/dashboard" },
  { labelKey: "admin", href: "/admin" },
];

export default function Navigation() {
  const t = useTranslations("Navigation");
  const { user, isLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticated(!!user);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }

  if (!isAuthenticated) {
    return <></>;
  }

  return (
    <div>
      <div className="hidden sm:flex">
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map(({ labelKey, href }) => (
              <NavigationMenuItem key={labelKey}>
                <Link href={href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t(labelKey)}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Sheet>
        <SheetTrigger asChild className="sm:hidden">
          <Button variant="secondary" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-secondary rounded-l-3xl">
          <SheetHeader>
            <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("navigation")}
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-8 flex flex-col items-start gap-y-3">
            {navItems.map(({ labelKey, href }) => (
              <SheetClose key={labelKey} asChild>
                <Button asChild variant="ghost">
                  <Link href={href}>{t(labelKey)}</Link>
                </Button>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

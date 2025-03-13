import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

const Container = ({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) => {
  return (
    <div className={cn("container mx-auto px-4 sm:px-8", className)}>
      {children}
    </div>
  );
};

export default Container;

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export default function NavLink({
  href,
  children,
  disabled,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      {disabled ? (
        <> {children}</>
      ) : (
        <a
          {...props}
          href={href}
          className={cn("inline-flex items-center", className)}
          onClick={() => startTransition(() => router.push(href))}
          style={{ cursor: isPending ? "wait" : "pointer" }}
        >
          {children}
        </a>
      )}
    </>
  );
}

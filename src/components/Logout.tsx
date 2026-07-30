import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/utils/cn";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Logout() {
  const { signOut } = useAuthActions();
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger className="w-full">
          <div className={cn(buttonVariants({ variant: "destructive" }), "w-full")}>Logout</div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure, you want to logout?</AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void signOut().then(() => window.location.reload())}
              className={buttonVariants({ variant: "destructive" })}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";
import Image from "next/image";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Atlos from "@/components/Ad/Atlos";

export default function AtlosDialog() {
  return (
    <>
      <Dialog>
        <DialogTrigger className="flex justify-center items-center w-[45%] p-8 border-2  border-dashed">
          <span className="text-3xl bg-linear-to-r from-purple-500 to-yellow-500 bg-clip-text text-transparent  font-bold animate-pulse bg-size-[200%_auto]">
            Atlos Crypto Payment
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atlos Crypto Payment</DialogTitle>
            <DialogDescription>
              <Atlos />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

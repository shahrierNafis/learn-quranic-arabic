"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "./ui/label";

export type Option = { label: string; value: string };

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({ options, selectedValues, onChange, placeholder = "Select...", label }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  // Generates a unique ID for accessible labeling
  const generatedId = React.useId();

  const handleSelect = (currentValue: string) => {
    onChange(
      selectedValues.includes(currentValue)
        ? selectedValues.filter((item) => item !== currentValue)
        : [...selectedValues, currentValue],
    );
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      {label && <Label htmlFor={generatedId}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button variant="outline" className="w-full justify-between h-auto py-2 px-3">
            <div className="flex flex-wrap gap-1">
              {selectedValues.length === 0 && <span>{placeholder}</span>}
              {selectedValues.map((value) => (
                <Badge variant="secondary" key={value} className="rounded-sm px-1 text-xs">
                  {options.find((o) => o.value === value)?.label}
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(value);
                    }}
                  />
                </Badge>
              ))}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

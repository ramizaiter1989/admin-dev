import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          "relative flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
        month: "space-y-4 px-6",

        caption: "relative flex items-center justify-center h-10 px-12",
        caption_label: "text-sm font-medium",

        nav: "absolute top-0 left-0 right-0 h-10 px-2 z-50 pointer-events-none",

        button_previous:
          "pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 " +
          "inline-flex items-center justify-center h-9 w-9 rounded-full border border-primary bg-white text-primary shadow-sm " +
          "transition hover:bg-primary hover:text-primary-foreground " +
          "disabled:opacity-30 disabled:pointer-events-none",

        button_next:
          "pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 " +
          "inline-flex items-center justify-center h-9 w-9 rounded-full border border-primary bg-white text-primary shadow-sm " +
          "transition hover:bg-primary hover:text-primary-foreground " +
          "disabled:opacity-30 disabled:pointer-events-none",

        table: "w-full border-collapse space-y-1",

        weekdays: "grid grid-cols-7",
        weekday:
          "text-muted-foreground rounded-md text-center font-normal text-[0.8rem]",

        week: "grid grid-cols-7 w-full mt-2",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-full p-0 font-normal aria-selected:opacity-100",
        ),

        selected:
          "!bg-primary !text-primary-foreground hover:!bg-primary focus:!bg-primary",
        range_start:
          "day-range-start !bg-primary !text-primary-foreground hover:!bg-primary focus:!bg-primary",
        range_end:
          "day-range-end !bg-primary !text-primary-foreground hover:!bg-primary focus:!bg-primary",
        range_middle:
          "day-range-middle !bg-primary/15 !text-foreground hover:!bg-primary/15 focus:!bg-primary/15",

        today: "bg-accent text-accent-foreground",

        outside: "rdp-day_outside",
        hidden: "rdp-day_hidden",
      }}
      components={{
        IconLeft: ({ className, ...p }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...p} />
        ),
        IconRight: ({ className, ...p }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...p} />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
export { Calendar };

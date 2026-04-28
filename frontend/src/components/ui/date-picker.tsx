"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string | Date
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  fromYear?: number
  toYear?: number
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Pick a date", 
  className,
  fromYear = 1980,
  toYear = new Date().getFullYear()
}: DatePickerProps) {
  const date = value ? new Date(value) : undefined

  // Default month to show — either the selected date or today
  const defaultMonth = date || new Date()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-background/50 border-input",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0 shadow-modal" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={defaultMonth}
          onSelect={(d) => {
            if (d) {
              // Set to noon to avoid timezone shift when converting to ISO
              const safe = new Date(d)
              safe.setHours(12, 0, 0, 0)
              onChange?.(safe.toISOString())
            }
          }}
          captionLayout="dropdown"
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
        />
      </PopoverContent>
    </Popover>
  )
}

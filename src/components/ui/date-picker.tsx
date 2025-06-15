
"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  yearRange?: number // How many years back from current year (default: 100)
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Select date",
  className,
  disabled = false,
  yearRange = 100,
}: DatePickerProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [selectedYear, setSelectedYear] = React.useState<number | undefined>(date ? date.getFullYear() : undefined)

  // Generate years (yearRange years back from current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: yearRange }, (_, i) => currentYear - i)

  // Handle year change
  const handleYearChange = (year: string) => {
    const numYear = Number.parseInt(year)
    setSelectedYear(numYear)

    if (date) {
      const newDate = new Date(date)
      newDate.setFullYear(numYear)
      setDate(newDate)
    } else {
      // If no date is selected, create a new date with the selected year and today's month/day
      const newDate = new Date()
      newDate.setFullYear(numYear)
      setDate(newDate)
    }
  }

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Select Year</div>
              <Select value={selectedYear?.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[110px] h-8">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              if (newDate) {
                setSelectedYear(newDate.getFullYear())
              }
              setCalendarOpen(false)
            }}
            initialFocus
            defaultMonth={date || (selectedYear ? new Date(selectedYear, 0) : undefined)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

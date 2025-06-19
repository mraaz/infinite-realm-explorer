
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface YearPickerProps {
  year: number | undefined
  setYear: (year: number | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  yearRange?: number // How many years back from current year (default: 100)
}

export function YearPicker({
  year,
  setYear,
  placeholder = "Select year",
  className,
  disabled = false,
  yearRange = 100,
}: YearPickerProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  // Generate years (yearRange years back from current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: yearRange }, (_, i) => currentYear - i)

  const handleYearChange = (yearValue: string) => {
    const numYear = Number.parseInt(yearValue)
    setYear(numYear)
    setPopoverOpen(false)
  }

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", !year && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {year ? year.toString() : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <Select value={year?.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {years.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

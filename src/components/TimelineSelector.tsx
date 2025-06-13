import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { format, addDays, parseISO, isAfter, differenceInDays } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";

interface TimelineSelectorProps {
  minDate: string;
  maxDate: string;
  onRangeChange: (range: [string, string]) => void;
}

export default function TimelineSelector({
  minDate,
  maxDate,
  onRangeChange,
}: TimelineSelectorProps) {
  // Convert string dates to Date objects
  const minDateObj = parseISO(minDate);
  const maxDateObj = parseISO(maxDate);
  
  // Calculate total days between min and max
  const daysDiff = Math.round(
    (maxDateObj.getTime() - minDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate selected start and end dates based on slider values
  const getSelectedDates = (): [Date, Date] => {
    // sliderValues[0] is the position of the bottom thumb (0=minDate, 100=maxDate)
    // sliderValues[1] is the position of the top thumb (0=minDate, 100=maxDate)
    const startDaysOffset = Math.floor((sliderValues[0] / 100) * daysDiff);
    const endDaysOffset = Math.floor((sliderValues[1] / 100) * daysDiff);
    
    let startDate = addDays(minDateObj, startDaysOffset);
    let endDate = addDays(minDateObj, endDaysOffset);

    // Ensure startDate is not after endDate (can happen if thumbs cross or daysDiff is 0)
    if (isAfter(startDate, endDate)) {
        [startDate, endDate] = [endDate, startDate]; 
    }
    
    return [startDate, endDate];
  };
  
  // State for the slider values (0-100). 
  // [0, 100] means [bottomThumb, topThumb].
  // To select the most recent day (maxDateObj), both thumbs should be at 100.
  const [sliderValues, setSliderValues] = useState<[number, number]>([100, 100]);
  
  // State for DayPicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Initialize selectedDateRangeForPicker based on the initial sliderValues
  const [initialStartDate, initialEndDate] = getSelectedDates();
  const [selectedDateRangeForPicker, setSelectedDateRangeForPicker] = useState<DateRange | undefined>(
    { from: initialStartDate, to: initialEndDate }
  );

  // Effect to update picker range when slider values change (e.g. by dragging)
  useEffect(() => {
    const [currentSliderStartDate, currentSliderEndDate] = getSelectedDates();
    // Only update if the dates actually differ to prevent potential loops or unnecessary re-renders
    if (
      !selectedDateRangeForPicker || 
      selectedDateRangeForPicker.from?.getTime() !== currentSliderStartDate.getTime() || 
      selectedDateRangeForPicker.to?.getTime() !== currentSliderEndDate.getTime()
    ) {
        setSelectedDateRangeForPicker({ from: currentSliderStartDate, to: currentSliderEndDate });
    }
  }, [sliderValues]); // getSelectedDates is not stable, sliderValues is the correct dependency
  
  // Format dates in a readable way: 5 mei 2023
  const formatDateNL = (date: Date): string => {
    return format(date, "d MMM yyyy", { locale: nl });
  };
  
  // Update parent component when slider values change
  useEffect(() => {
    const [startDate, endDate] = getSelectedDates();
    onRangeChange([
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd"),
    ]);
  }, [sliderValues, onRangeChange]); // onRangeChange added as dependency

  const handleDatePickerSelect = (newRange: DateRange | undefined) => {
    setSelectedDateRangeForPicker(newRange); // Update de state voor de DayPicker altijd

    if (newRange?.from && newRange?.to) {
      setShowDatePicker(false); // Sluit de Popover alleen als de range compleet is
      
      const fromDate = newRange.from;
      const toDate = newRange.to;
      // Zorg dat fromDate altijd vóór of gelijk aan toDate is voor de sliderlogica
      const orderedFromDate = isAfter(fromDate, toDate) ? toDate : fromDate;
      const orderedToDate = isAfter(fromDate, toDate) ? fromDate : toDate;

      if (daysDiff === 0) {
        setSliderValues([100, 100]); 
        return;
      }

      const startDaysOffset = Math.max(0, Math.min(differenceInDays(orderedFromDate, minDateObj), daysDiff));
      const endDaysOffset = Math.max(0, Math.min(differenceInDays(orderedToDate, minDateObj), daysDiff));
      
      const newSliderValueForStart = (startDaysOffset / daysDiff) * 100;
      const newSliderValueForEnd = (endDaysOffset / daysDiff) * 100;

      setSliderValues([
        Math.round(newSliderValueForStart), 
        Math.round(newSliderValueForEnd)
      ]);
    } 
    // Als newRange.from wel bestaat maar newRange.to niet, dan is de gebruiker bezig met het selecteren van een range.
    // De Popover blijft open omdat setShowDatePicker(false) niet wordt aangeroepen.
    // De DayPicker zou de selectie van de eerste datum moeten tonen.
  };
  
  return (
    <div className="h-full p-5 bg-card shadow-md flex flex-col rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Tijdlijn</h2>
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="p-1">
              <CalendarIcon className="h-5 w-5 text-muted-foreground cursor-pointer" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedDateRangeForPicker?.from || minDateObj}
              selected={selectedDateRangeForPicker}
              onSelect={handleDatePickerSelect}
              numberOfMonths={1} // Show one month at a time
              min={minDateObj} // Set min selectable date
              max={maxDateObj} // Set max selectable date
              locale={nl}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* <div className="bg-accent/20 p-3 rounded-md space-y-1 mb-4">
        <div className="flex items-center space-x-1 text-sm">
          <div className="w-3 h-3 bg-primary/60 rounded-full"></div>
          <span className="font-medium">Van:</span>
          <span>{formatDateNL(getSelectedDates()[0])}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="font-medium">Tot:</span>
          <span>{formatDateNL(getSelectedDates()[1])}</span>
        </div>
      </div> */}
      
      {/* Main timeline area with vertical slider */}
      <div className="flex-1 flex">
        {/* Vertical slider */}
        <div className="relative h-full flex items-center">
          <Slider
            defaultValue={[100, 100]}
            value={sliderValues}
            onValueChange={(value) => setSliderValues(value as [number, number])}
            max={100}
            step={1}
            orientation="vertical"
            className="h-[calc(100%-40px)] mx-auto"
          />
        </div>
        
        {/* Date labels */}
        <div className="flex flex-col justify-between h-[calc(100%-40px)] ml-2 text-xs text-muted-foreground">
          <span>{formatDateNL(maxDateObj)}</span>
          <span>{formatDateNL(minDateObj)}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => setSliderValues([0, 100])}
          className="w-full py-2 px-3 text-xs bg-accent hover:bg-accent/80 rounded-md transition-colors"
        >
          Alle data
        </button>
      </div>
    </div>
  );
} 
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { format, addDays, parseISO, isBefore, isAfter } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar } from "lucide-react";

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
  
  // State for the slider values (0-100)
  const [sliderValues, setSliderValues] = useState<[number, number]>([0, 100]);
  
  // Calculate selected start and end dates based on slider values
  const getSelectedDates = (): [Date, Date] => {
    // For vertical slider, we need to reverse the values (100 is bottom, 0 is top)
    const startDays = Math.floor(((100 - sliderValues[1]) / 100) * daysDiff);
    const endDays = Math.floor(((100 - sliderValues[0]) / 100) * daysDiff);
    
    const startDate = addDays(minDateObj, startDays);
    const endDate = addDays(minDateObj, endDays);
    
    return [startDate, endDate];
  };
  
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
  }, [sliderValues]);
  
  return (
    <div className="h-full p-5 bg-card shadow-md flex flex-col rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Tijdlijn</h2>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="bg-accent/20 p-3 rounded-md space-y-1 mb-4">
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
      </div>
      
      {/* Main timeline area with vertical slider */}
      <div className="flex-1 flex">
        {/* Vertical slider */}
        <div className="relative h-full flex items-center">
          <Slider
            defaultValue={[0, 100]}
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
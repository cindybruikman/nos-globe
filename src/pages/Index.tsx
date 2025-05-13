import { useState, useEffect } from "react";
import {
  newsStories,
  getStoriesByCategory,
  getStoriesBySearch,
  NewsStory,
} from "@/utils/mockData";
import { TheWorld as Globe } from "@/components/Globe";
import SearchBar from "@/components/SearchBar";
import CategoryFilters from "@/components/CategoryFilters";
import NewsCard from "@/components/NewsCard";
import TimelineSelector from "@/components/TimelineSelector";
import { toast } from "sonner";
import { getCountryISO } from "@/utils/countryMapping";
import NOSLogo from "@/components/NOSLogo";
import { isWithinInterval, parseISO, format } from "date-fns";
import { nl } from "date-fns/locale";

const Index = () => {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [storiesForGlobe, setStoriesForGlobe] = useState<NewsStory[]>(newsStories);
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<[string, string]>(() => {
    // Find min and max dates from all stories
    const dates = newsStories.map(story => new Date(story.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    return [
      minDate.toISOString().split('T')[0],
      maxDate.toISOString().split('T')[0]
    ];
  });
  const [visibleStoryIdsFromGlobe, setVisibleStoryIdsFromGlobe] = useState<string[] | null>(null);
  const [focusedCoordinates, setFocusedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [highlightedCountryIds, setHighlightedCountryIds] = useState<string[] | null>(
    null
  );

  // Function to get min and max dates from stories
  const getMinMaxDates = (): { minDate: string; maxDate: string } => {
    const dates = newsStories.map(story => new Date(story.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return {
      minDate: minDate.toISOString().split('T')[0],
      maxDate: maxDate.toISOString().split('T')[0]
    };
  };

  const handleVisibleStoriesChange = (ids: string[]) => {
    setVisibleStoryIdsFromGlobe(ids);
  };

  const handleDateRangeChange = (range: [string, string]) => {
    setDateRange(range);
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
    setFocusedCoordinates(null);
    setHighlightedCountryIds(null);
  };

  useEffect(() => {
    let result = [...newsStories];
    const categoryFilterActive = !!activeCategory;
    const searchQueryActive = searchQuery.trim() !== "";
    const dateRangeActive = dateRange && dateRange.length === 2;

    // Apply category and search filters first
    if (categoryFilterActive && searchQueryActive) {
      const categoryStories = getStoriesByCategory(activeCategory);
      const searchResults = getStoriesBySearch(searchQuery);
      result = newsStories.filter(story =>
        categoryStories.some(cs => cs.id === story.id) &&
        searchResults.some(sr => sr.id === story.id)
      );
    } else if (categoryFilterActive) {
      result = getStoriesByCategory(activeCategory);
    } else if (searchQueryActive) {
      result = getStoriesBySearch(searchQuery);
    }

    // Apply date range filter
    if (dateRangeActive) {
      const [startDate, endDate] = dateRange;
      result = result.filter(story => {
        const storyDate = parseISO(story.date);
        return isWithinInterval(storyDate, {
          start: parseISO(startDate),
          end: parseISO(endDate)
        });
      });
    }

    setStoriesForGlobe(result);
  }, [activeCategory, searchQuery, dateRange]);

  useEffect(() => {
    let filteredForDisplay = [...storiesForGlobe];

    if (visibleStoryIdsFromGlobe !== null) {
      if (visibleStoryIdsFromGlobe.length > 0) {
        filteredForDisplay = filteredForDisplay.filter(story => 
          visibleStoryIdsFromGlobe.includes(story.id)
        );
      } else {
        filteredForDisplay = [];
      }
    }

    filteredForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setStories(filteredForDisplay.slice(0, 10));
  }, [storiesForGlobe, visibleStoryIdsFromGlobe, activeCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStorySelect = (story: NewsStory) => {
    setSelectedStory(story);
    if (story.locations && story.locations.length > 0) {
      setFocusedCoordinates(story.locations[0].coordinates);
      const countryIsos = story.locations.map(loc => getCountryISO(loc.country));
      setHighlightedCountryIds(countryIsos);
    } else {
      setFocusedCoordinates(null);
      setHighlightedCountryIds(null);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Get min and max dates for the TimelineSelector
  const { minDate, maxDate } = getMinMaxDates();

  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="w-full py-4 px-4 flex-shrink-0">
        <div className="container mx-auto">
          <div className="flex items-center justify-between pb-4 gap-4 mb-4 w-full">
            <NOSLogo />
            <SearchBar onSearch={handleSearch} />
          </div>
          <CategoryFilters
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </header>

      <main className="flex-1 flex w-full px-12 py-8 overflow-hidden gap-4">
        {/* Timeline Selector on the left (with proper margins) */}
        <div className="w-52 flex-shrink-0 h-[calc(100%-50px)] self-center">
          <TimelineSelector 
            minDate={minDate}
            maxDate={maxDate}
            onRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Globe in the center with more space and wider canvas */}
        <div className="flex-1 flex items-center justify-center relative min-h-0 h-auto overflow-hidden">
          <Globe
            width={1200}
            height={900}
            openModal={(data) => {
              const story = stories.find(s => s.id === data.prismic);
              if (story) {
                handleStorySelect(story);
              }
            }}
            stories={storiesForGlobe}
            renderableStoryIds={stories.map(s => s.id)}
            focusedCoordinates={focusedCoordinates}
            highlightedCountryIds={highlightedCountryIds}
            onVisibleStoriesChange={handleVisibleStoriesChange}
          />
        </div>

        {/* News sidebar on the right (with proper margins) */}
        <div className="w-96 flex-shrink-0 h-[calc(100%-50px)] self-center">
          <div className="bg-card rounded-xl shadow-lg p-50 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-1">
              {searchQuery
                ? `Zoekresultaten voor "${searchQuery}"`
                : activeCategory
                ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} nieuws`
                : "Wereldnieuws"}
            </h2>
            
            {/* Add date range info */}
            <p className="text-xs text-muted-foreground mb-4">
              {format(parseISO(dateRange[0]), "d MMM yyyy", { locale: nl })} - {format(parseISO(dateRange[1]), "d MMM yyyy", { locale: nl })}
            </p>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <NewsCard
                    key={story.id}
                    story={story}
                    onClick={handleStorySelect}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Geen verhalen gevonden
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedStory && (
        <div
          className="fixed left-[40%] bottom-8 z-50 transform -translate-x-1/2 bg-card rounded-xl shadow-lg px-6 py-4 max-w-md w-[90vw] border border-border animate-fade-in"
          style={{ minWidth: 320, maxWidth: 480, boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleClosePreview();
            }}
            className="absolute top-2 right-2 text-foreground hover:text-muted-foreground text-2xl leading-none"
            aria-label="Sluit artikel preview"
          >
            &times;
          </button>
          <div onClick={() => window.open(`/article/${selectedStory.id}`, '_blank')} className="cursor-pointer">
            <h2 className="text-lg font-semibold mb-2 pr-6">{selectedStory.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {selectedStory.date} • 
              {selectedStory.locations && selectedStory.locations.length > 0 
                ? selectedStory.locations.map(loc => loc.country).join(', ') 
                : 'Locatie onbekend'}
            </p>
            <p className="text-sm line-clamp-4">{selectedStory.summary}</p>
            <div className="text-xs text-primary mt-2">Klik om het volledige artikel te openen</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

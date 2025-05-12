import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";
import CategoryPill from "@/components/CategoryPill";

const Index = () => {
  const [stories, setStories] = useState<NewsStory[]>(newsStories);
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [visibleCountries, setVisibleCountries] = useState<string[]>([]);

  // Filter stories based on category, search query, and visible countries
  const filteredStories = useMemo(() => {
    return stories
      .filter((story) => {
        // Apply category filter if active
        if (activeCategory && story.category !== activeCategory && 
            !(activeCategory === 'politics' && story.category === 'politiek') && 
            !(activeCategory === 'technology' && story.category === 'techniek') &&
            !(activeCategory === 'science' && story.category === 'klimaat')) {
          return false;
        }
        
        // Apply search filter if query exists
        if (
          searchQuery &&
          !story.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !story.summary.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        
        // Apply visibility filter if we have visible countries
        if (visibleCountries.length > 0) {
          // Only show stories with countries visible in the current view
          return visibleCountries.includes(story.country);
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stories, activeCategory, searchQuery, visibleCountries]);

  // Handle category selection
  useEffect(() => {
    const filteredStories = getStoriesByCategory(activeCategory);
    setStories(filteredStories);

    if (activeCategory) {
      toast.info(
        `${filteredStories.length} verhalen in deze categorie gevonden`
      );
    }
  }, [activeCategory]);

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setStories(getStoriesByCategory(activeCategory));
      setSearchQuery("");
      return;
    }

    setSearchQuery(query);
    const results = getStoriesBySearch(query);
    setStories(results);

    toast.info(`${results.length} resultaten gevonden voor "${query}"`);
  };

  // Handle story selection
  const handleStorySelect = (story: NewsStory) => {
    setSelectedStory(story);
    // In a real app, this would animate the globe to center on the story's location
  };

  // Handle mouse enter on a story card
  const handleStoryMouseEnter = (story: NewsStory) => {
    setHoveredCountry(story.country);
  };

  // Handle mouse leave from a story card
  const handleStoryMouseLeave = () => {
    setHoveredCountry(null);
  };

  // Handle visible countries change from Globe component
  const handleVisibleCountriesChange = (countries: string[]) => {
    setVisibleCountries(countries);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header with search and filters */}
      <header className="w-full py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search news..."
              className="flex-1 p-2 border rounded-md bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Category filters */}
            <div className="flex gap-2 flex-wrap">
              <CategoryPill
                category="all"
                label="All"
                isActive={activeCategory === null}
                onClick={() => setActiveCategory(null)}
              />
              <CategoryPill
                category="politics"
                label="Politics"
                isActive={activeCategory === "politics"}
                onClick={() => setActiveCategory("politics")}
              />
              <CategoryPill
                category="technology"
                label="Tech"
                isActive={activeCategory === "technology"}
                onClick={() => setActiveCategory("technology")}
              />
              <CategoryPill
                category="science"
                label="Science"
                isActive={activeCategory === "science"}
                onClick={() => setActiveCategory("science")}
              />
            </div>
          </div>
          
          {/* Visibility filter indicator */}
          {visibleCountries.length > 0 && (
            <div className="mb-4 py-2 px-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-blue-700">
                Showing {filteredStories.length} news items from {visibleCountries.length} visible regions
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content: Globe and news feed */}
      <main className="flex-1 flex flex-col lg:flex-row container mx-auto px-4 gap-8 pb-8">
        {/* Left side: Globe */}
        <div className="flex-1 lg:h-[calc(100vh-220px)] h-[50vh] relative">
          <Globe
            width={800}
            height={800}
            zoomTargetCountry={hoveredCountry}
            onVisibleCountriesChange={handleVisibleCountriesChange}
            openModal={(data) => {
              console.log("Modal data", data);
              // eventueel setSelectedStory(data)
            }}
          />
        </div>

        {/* Right side: News feed */}
        <div className="lg:w-96 w-full">
          <div className="bg-card rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">
              {searchQuery
                ? `Zoekresultaten voor "${searchQuery}"`
                : activeCategory
                ? `${
                    activeCategory.charAt(0).toUpperCase() +
                    activeCategory.slice(1)
                  } nieuws`
                : "Wereldnieuws"}
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <NewsCard
                    key={story.id}
                    story={story}
                    onClick={handleStorySelect}
                    onMouseEnter={() => handleStoryMouseEnter(story)}
                    onMouseLeave={handleStoryMouseLeave}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Geen verhalen gevonden
                </div>
              )}
            </div>
          </div>

          {/* Selected story details */}
          {selectedStory && (
            <div className="mt-4 bg-card rounded-lg shadow-lg p-4 animate-fade-in">
              <h2 className="text-lg font-semibold mb-2">
                {selectedStory.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedStory.date} • {selectedStory.country}
              </p>
              <p className="text-sm">{selectedStory.summary}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

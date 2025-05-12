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
import { toast } from "sonner";
import { getCountryISO } from "@/utils/countryMapping";

const Index = () => {
  const [stories, setStories] = useState<NewsStory[]>(newsStories.slice(0, 10));
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedCoordinates, setFocusedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [highlightedCountryId, setHighlightedCountryId] = useState<string | null>(
    null
  );

  // Handle category selection
  useEffect(() => {
    const filteredStories = getStoriesByCategory(activeCategory);
    setStories(filteredStories.slice(0, 10));
    if (activeCategory) {
      toast.info(
        `${filteredStories.length} verhalen in deze categorie gevonden`
      );
    }
  }, [activeCategory]);

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      const filteredStories = getStoriesByCategory(activeCategory);
      setStories(filteredStories.slice(0, 10));
      setSearchQuery("");
      return;
    }
    setSearchQuery(query);
    const results = getStoriesBySearch(query);
    setStories(results.slice(0, 10));
    toast.info(`${results.length} resultaten gevonden voor "${query}"`);
  };

  // Handle story selection
  const handleStorySelect = (story: NewsStory) => {
    setSelectedStory(story);
    setFocusedCoordinates(story.coordinates);
    setHighlightedCountryId(getCountryISO(story.country));
  };

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header with search and filters */}
      <header className="w-full py-6 px-4 flex-shrink-0">
        <div className="container mx-auto">
          <SearchBar onSearch={handleSearch} />
          <CategoryFilters
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </header>

      {/* Main content: Globe and news feed */}
      <main className="flex-1 flex container mx-auto px-4 gap-8 pb-8 overflow-hidden">
        {/* Left side: Globe Area */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          {/* Globe Component - Centered */}
          <Globe
            width={800}
            height={800}
            openModal={(data) => {
              const story = stories.find(s => s.id === data.prismic);
              if (story) {
                handleStorySelect(story);
              }
            }}
            stories={stories}
            focusedCoordinates={focusedCoordinates}
            highlightedCountryId={highlightedCountryId}
          />
        </div>

        {/* Right side: News feed */}
        <div className="lg:w-96 w-full flex-shrink-0">
          <div className="bg-card rounded-lg shadow-lg p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {searchQuery
                ? `Zoekresultaten voor "${searchQuery}"`
                : activeCategory
                ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} nieuws`
                : "Wereldnieuws"}
            </h2>
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

      {/* Floating summary card - Positioned near bottom, shifted left */}
      {selectedStory && (
        <div
          className="fixed left-[40%] bottom-8 z-50 transform -translate-x-1/2 bg-card rounded-xl shadow-lg px-6 py-4 max-w-md w-[90vw] cursor-pointer border border-border animate-fade-in"
          style={{ minWidth: 320, maxWidth: 480, boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
          onClick={() => window.open(`/article/${selectedStory.id}`, '_blank')}
        >
          <h2 className="text-lg font-semibold mb-2">{selectedStory.title}</h2>
          <p className="text-sm text-muted-foreground mb-2">
            {selectedStory.date} • {selectedStory.country}
          </p>
          <p className="text-sm line-clamp-4">{selectedStory.summary}</p>
          <div className="text-xs text-primary mt-2">Klik om het volledige artikel te openen</div>
        </div>
      )}
    </div>
  );
};

export default Index;

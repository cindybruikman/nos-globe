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
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [storiesForGlobe, setStoriesForGlobe] = useState<NewsStory[]>(newsStories);
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleStoryIdsFromGlobe, setVisibleStoryIdsFromGlobe] = useState<string[] | null>(null);
  const [focusedCoordinates, setFocusedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [highlightedCountryId, setHighlightedCountryId] = useState<string | null>(
    null
  );

  const handleVisibleStoriesChange = (ids: string[]) => {
    setVisibleStoryIdsFromGlobe(ids);
  };

  useEffect(() => {
    let result = [...newsStories];
    const categoryFilterActive = !!activeCategory;
    const searchQueryActive = searchQuery.trim() !== "";

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
    setStoriesForGlobe(result);
  }, [activeCategory, searchQuery]);

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

    // Toast messages (can be adjusted based on the final count in 'stories')
    // const finalStoryCount = filteredForDisplay.slice(0, 10).length;
    // if (searchQuery.trim()) {
    //   toast.info(`${finalStoryCount} resultaten gevonden voor "${searchQuery}" (zichtbaar op kaart)`);
    // } else if (activeCategory) {
    //   toast.info(`${finalStoryCount} verhalen in categorie "${activeCategory}" (zichtbaar op kaart)`);
    // }
  }, [storiesForGlobe, visibleStoryIdsFromGlobe, activeCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStorySelect = (story: NewsStory) => {
    setSelectedStory(story);
    if (story.locations && story.locations.length > 0) {
      setFocusedCoordinates(story.locations[0].coordinates);
      setHighlightedCountryId(getCountryISO(story.locations[0].country));
    } else {
      setFocusedCoordinates(null);
      setHighlightedCountryId(null);
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

  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="w-full py-6 px-4 flex-shrink-0">
        <div className="container mx-auto">
          <SearchBar onSearch={handleSearch} />
          <CategoryFilters
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </header>

      <main className="flex-1 flex container mx-auto px-4 gap-8 pb-8 overflow-hidden">
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <Globe
            width={800}
            height={800}
            openModal={(data) => {
              const story = stories.find(s => s.id === data.prismic);
              if (story) {
                handleStorySelect(story);
              }
            }}
            stories={storiesForGlobe}
            renderableStoryIds={stories.map(s => s.id)}
            focusedCoordinates={focusedCoordinates}
            highlightedCountryId={highlightedCountryId}
            onVisibleStoriesChange={handleVisibleStoriesChange}
          />
        </div>

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

      {selectedStory && (
        <div
          className="fixed left-[40%] bottom-8 z-50 transform -translate-x-1/2 bg-card rounded-xl shadow-lg px-6 py-4 max-w-md w-[90vw] cursor-pointer border border-border animate-fade-in"
          style={{ minWidth: 320, maxWidth: 480, boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}
          onClick={() => window.open(`/article/${selectedStory.id}`, '_blank')}
        >
          <h2 className="text-lg font-semibold mb-2">{selectedStory.title}</h2>
          <p className="text-sm text-muted-foreground mb-2">
            {selectedStory.date} • 
            {selectedStory.locations && selectedStory.locations.length > 0 
              ? selectedStory.locations.map(loc => loc.country).join(', ') 
              : 'Locatie onbekend'}
          </p>
          <p className="text-sm line-clamp-4">{selectedStory.summary}</p>
          <div className="text-xs text-primary mt-2">Klik om het volledige artikel te openen</div>
        </div>
      )}
    </div>
  );
};

export default Index;

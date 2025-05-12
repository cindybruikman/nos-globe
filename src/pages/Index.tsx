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

const Index = () => {
  const [stories, setStories] = useState<NewsStory[]>(newsStories);
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header with search and filters */}
      <header className="w-full py-6 px-4">
        <div className="container mx-auto">
          <SearchBar onSearch={handleSearch} />
          <CategoryFilters
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </header>

      {/* Main content: Globe and news feed */}
      <main className="flex-1 flex flex-col lg:flex-row container mx-auto px-4 gap-8 pb-8">
        {/* Left side: Globe */}
        <div className="flex-1 lg:h-[calc(100vh-220px)] h-[50vh] relative">
          <Globe
            width={800}
            height={800}
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

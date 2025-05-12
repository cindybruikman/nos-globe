
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="search"
          placeholder="Zoekwoord"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-12 py-3 bg-muted text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
      </div>
    </form>
  );
};

export default SearchBar;

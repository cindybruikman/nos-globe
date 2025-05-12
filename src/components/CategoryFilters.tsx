
import { categories } from "@/utils/mockData";

interface CategoryFiltersProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const CategoryFilters = ({ activeCategory, setActiveCategory }: CategoryFiltersProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mx-auto mt-6">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`px-4 py-2 rounded-full category ${category.className} ${
            activeCategory === category.id ? "ring-2 ring-white" : ""
          }`}
          onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;

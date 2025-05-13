import { categories } from "@/utils/mockData";

interface CategoryFiltersProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

// Dynamisch geladen icon-paden
const iconMap: Record<string, string> = {
  cultuur: new URL("@/assets/icons/cultuur-dark.svg", import.meta.url).href,
  economie: new URL("@/assets/icons/economie-dark.svg", import.meta.url).href,
  laatste: new URL("@/assets/icons/laatste-dark.svg", import.meta.url).href,
  opmerkelijk: new URL("@/assets/icons/opmerkelijk-dark.svg", import.meta.url)
    .href,
  politiek: new URL("@/assets/icons/politiek-dark.svg", import.meta.url).href,
  sport: new URL("@/assets/icons/sport-dark.svg", import.meta.url).href,
  tech: new URL("@/assets/icons/tech-dark.svg", import.meta.url).href,
};

const CategoryFilters = ({
  activeCategory,
  setActiveCategory,
}: CategoryFiltersProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mx-auto mt-6">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition text-white bg-[#444444] hover:bg-[#333333] ${
            activeCategory === category.id ? "ring-2 ring-white" : ""
          }`}
          onClick={() =>
            setActiveCategory(
              activeCategory === category.id ? null : category.id
            )
          }
        >
          <img
            src={iconMap[category.id]}
            alt={category.name}
            className="w-5 h-5"
          />
          <span className="text-sm font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;

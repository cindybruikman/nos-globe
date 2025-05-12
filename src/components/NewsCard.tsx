import { NewsStory } from "@/utils/mockData";
import { getCountryISO } from "@/utils/countryMapping";
import { getCountryColor } from "@/utils/countryColors";

interface NewsCardProps {
  story: NewsStory;
  onClick: (story: NewsStory) => void;
}

const NewsCard = ({ story, onClick }: NewsCardProps) => {
  const iso = getCountryISO(story.country);
  const countryColor = getCountryColor(iso);

  return (
    <div 
      className="news-card bg-card rounded-lg overflow-hidden shadow-md cursor-pointer animate-fade-in"
      onClick={() => onClick(story)}
    >
      <div className="flex items-center p-2">
        {/* Colored bar */}
        <div style={{ background: countryColor, width: 6, height: 56, borderRadius: 4 }} className="mr-2 flex-shrink-0" />
        <div className="w-20 h-20 mr-3 rounded overflow-hidden flex-shrink-0">
          <img 
            src={story.imageUrl} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium line-clamp-2">{story.title}</h3>
          <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block bg-muted-foreground/10">
            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

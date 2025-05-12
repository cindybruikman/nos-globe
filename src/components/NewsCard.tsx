
import { NewsStory } from "@/utils/mockData";

interface NewsCardProps {
  story: NewsStory;
  onClick: (story: NewsStory) => void;
}

const NewsCard = ({ story, onClick }: NewsCardProps) => {
  const getCategoryClass = (category: string) => {
    switch (category) {
      case "politiek":
        return "category-politik";
      case "klimaat":
        return "category-klimaat";
      case "economie":
        return "category-economie";
      case "cultuur":
        return "category-cultuur";
      case "techniek":
        return "category-techniek";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div 
      className="news-card bg-card rounded-lg overflow-hidden shadow-md cursor-pointer animate-fade-in"
      onClick={() => onClick(story)}
    >
      <div className="flex items-center p-2">
        <div className="w-20 h-20 mr-3 rounded overflow-hidden flex-shrink-0">
          <img 
            src={story.imageUrl} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium line-clamp-2">{story.title}</h3>
          <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${getCategoryClass(story.category)}`}>
            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

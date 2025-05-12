
import { useEffect, useRef, useState } from "react";
import { globe } from "lucide-react";
import { NewsStory } from "@/utils/mockData";

interface GlobeProps {
  stories: NewsStory[];
  selectedStory: NewsStory | null;
  onSelectStory: (story: NewsStory) => void;
}

const Globe = ({ stories, selectedStory, onSelectStory }: GlobeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // In a real implementation, we would initialize a WebGL globe here
    // For this prototype, we'll use a placeholder with a loading state
    const loadGlobe = async () => {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate loading
      setIsLoading(false);
    };

    loadGlobe();

    // Cleanup function for a real implementation
    return () => {
      // Clean up WebGL context if needed
    };
  }, []);

  // Helper function to get highlight color for a story
  const getHighlightColor = (story: NewsStory) => {
    switch (story.category) {
      case "politiek": return "#e57373"; // red
      case "klimaat": return "#81c784"; // green
      case "economie": return "#64b5f6"; // blue
      case "cultuur": return "#ffd54f"; // yellow
      case "techniek": return "#a1887f"; // brown
      default: return "#e0e0e0"; // grey
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Placeholder for the globe */}
      <div className="globe-container">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/lovable-uploads/39dc61fa-6a73-42e8-acc0-40b632fae0e0.png" 
                alt="Interactive Globe"
                className="object-contain max-w-full max-h-full"
              />
            </div>
            <div className="globe-glow"></div>
            
            {/* This would be replaced by actual WebGL markers in a real implementation */}
            {stories.map((story) => (
              <div
                key={story.id}
                style={{
                  position: 'absolute',
                  // These coordinates would be calculated from 3D to 2D projection in real implementation
                  left: `${50 + story.coordinates[0] * 0.25}%`,
                  top: `${50 - story.coordinates[1] * 0.25}%`,
                  transform: 'translate(-50%, -50%)',
                  width: selectedStory?.id === story.id ? '15px' : '10px',
                  height: selectedStory?.id === story.id ? '15px' : '10px',
                  borderRadius: '50%',
                  backgroundColor: getHighlightColor(story),
                  boxShadow: selectedStory?.id === story.id ? '0 0 10px white' : 'none',
                  zIndex: selectedStory?.id === story.id ? 10 : 5,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectStory(story)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Globe;

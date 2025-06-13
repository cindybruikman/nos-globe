import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { newsStories, NewsStory } from '@/utils/mockData';

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<NewsStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundStory = newsStories.find(s => s.id === id);
      setStory(foundStory || null);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading article...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl mb-4">Article not found.</p>
        <a href="/" className="text-blue-500 hover:underline">
          Back to Home
        </a>
      </div>
    );
  }

  const contentToDisplay = story.fullText || story.summary;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <a href="/" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Globe
      </a>

      <article>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{story.title}</h1>
        <div className="text-sm text-muted-foreground mb-6">
          <span>{new Date(story.date).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="mx-2">•</span>
          <span>{story.country}</span>
          <span className="mx-2">•</span>
          <span className="capitalize">{story.category}</span>
        </div>

        {/* Optional: Display image if desired */}
        {/* 
        <img 
          src={story.imageUrl} 
          alt={story.title}
          className="w-full h-auto max-h-96 object-cover rounded-lg mb-6"
        /> 
        */}

        <div className="prose prose-lg max-w-none whitespace-pre-line">
          {contentToDisplay}
        </div>
      </article>
    </div>
  );
};

export default ArticlePage; 
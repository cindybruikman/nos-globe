
// Sample news data for the prototype
export interface NewsStory {
  id: string;
  title: string;
  category: 'politiek' | 'klimaat' | 'economie' | 'cultuur' | 'techniek';
  country: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  imageUrl: string;
  summary: string;
  date: string;
}

export const newsStories: NewsStory[] = [
  {
    id: '1',
    title: 'Paus roept op tot vrijlating journalisten bij eerste ontmoeting met pers',
    category: 'politiek',
    country: 'Vatican',
    region: 'Europe',
    coordinates: [12.45, 41.9],
    imageUrl: '/placeholder.svg',
    summary: 'Paus Franciscus heeft opgeroepen tot de vrijlating van journalisten wereldwijd tijdens zijn eerste persontmoeting als nieuwe paus.',
    date: '2023-05-12',
  },
  {
    id: '2',
    title: 'VN-voedselwaarschuwing: iedereen in Gaza riskeert hongersnood',
    category: 'politiek',
    country: 'Palestine',
    region: 'Middle East',
    coordinates: [34.3, 31.4],
    imageUrl: '/placeholder.svg',
    summary: 'De Verenigde Naties waarschuwen dat de gehele bevolking van Gaza hongersnood riskeert door aanhoudende conflicten en blokkades.',
    date: '2023-05-10',
  },
  {
    id: '3',
    title: 'Polen sluit Russisch consulaat als straf voor brand winkelcentrum',
    category: 'politiek',
    country: 'Poland',
    region: 'Europe',
    coordinates: [19.12, 52.22],
    imageUrl: '/placeholder.svg',
    summary: 'Polen heeft besloten het Russische consulaat te sluiten als reactie op een brand in een winkelcentrum die aan Rusland wordt toegeschreven.',
    date: '2023-05-09',
  },
  {
    id: '4',
    title: 'Dankzij AI is leider Burkina Faso een hype op social media: "Hij heeft de vibe"',
    category: 'techniek',
    country: 'Burkina Faso',
    region: 'Africa',
    coordinates: [-1.56, 12.36],
    imageUrl: '/placeholder.svg',
    summary: 'De leider van Burkina Faso is viral gegaan op sociale media dankzij AI-gegenereerde content die zijn charisma benadrukt.',
    date: '2023-05-08',
  },
  {
    id: '5',
    title: 'Recordtemperaturen gemeten in Zuidelijke Oceaan door klimaatverandering',
    category: 'klimaat',
    country: 'Antarctica',
    region: 'Antarctica',
    coordinates: [0, -70],
    imageUrl: '/placeholder.svg',
    summary: 'Wetenschappers hebben alarmerende recordtemperaturen gemeten in de Zuidelijke Oceaan, met mogelijke gevolgen voor zeespiegelstijging.',
    date: '2023-05-11',
  },
  {
    id: '6',
    title: 'Europese economie toont veerkracht ondanks inflatiedruk',
    category: 'economie',
    country: 'European Union',
    region: 'Europe',
    coordinates: [9.14, 48.52],
    imageUrl: '/placeholder.svg',
    summary: 'De Europese economie blijkt veerkrachtig te zijn ondanks aanhoudende inflatiedruk en geopolitieke spanningen.',
    date: '2023-05-07',
  },
  {
    id: '7',
    title: 'Nieuw festival viert culturele diversiteit in Aziatische gemeenschappen',
    category: 'cultuur',
    country: 'Japan',
    region: 'Asia',
    coordinates: [139.83, 35.65],
    imageUrl: '/placeholder.svg',
    summary: 'Een nieuw internationaal festival brengt diverse Aziatische culturele tradities samen in een maand van vieringen en uitwisselingen.',
    date: '2023-05-06',
  },
  {
    id: '8',
    title: 'Doorbraak in kwantumcomputing bereikt door internationale samenwerking',
    category: 'techniek',
    country: 'United States',
    region: 'North America',
    coordinates: [-122.33, 47.61],
    imageUrl: '/placeholder.svg',
    summary: 'Een internationaal team van wetenschappers heeft een significante doorbraak bereikt in kwantumcomputing door een nieuw type qubit te ontwikkelen.',
    date: '2023-05-05',
  },
];

export const categories = [
  { id: 'politiek', name: 'Politiek', className: 'category-politik' },
  { id: 'klimaat', name: 'Klimaat', className: 'category-klimaat' },
  { id: 'economie', name: 'Economie', className: 'category-economie' },
  { id: 'cultuur', name: 'Cultuur', className: 'category-cultuur' },
  { id: 'techniek', name: 'Techniek', className: 'category-techniek' },
];

export const getStoriesByCategory = (categoryId: string | null) => {
  if (!categoryId) return newsStories;
  return newsStories.filter(story => story.category === categoryId);
};

export const getStoriesBySearch = (query: string) => {
  const lowerCaseQuery = query.toLowerCase();
  return newsStories.filter(
    story => 
      story.title.toLowerCase().includes(lowerCaseQuery) || 
      story.country.toLowerCase().includes(lowerCaseQuery) ||
      story.summary.toLowerCase().includes(lowerCaseQuery)
  );
};

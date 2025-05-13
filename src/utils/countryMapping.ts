// Mapping between country names and their ISO codes
export const countryToISO: { [key: string]: string } = {
  'Afghanistan': 'AFG',
  'Argentina': 'ARG',
  'Australia': 'AUS',
  'Belgium': 'BEL',
  'Bolivia': 'BOL',
  'Brazil': 'BRA',
  'Burkina Faso': 'BFA',
  'Canada': 'CAN',
  'China': 'CHN',
  'Colombia': 'COL',
  'Egypt': 'EGY',
  'Estonia': 'EST',
  'European Union': 'EU', // Note: EU is not a standard ISO code, but we'll use it for the EU
  'Germany': 'DEU',
  'India': 'IND',
  'Iran': 'IRN',
  'Ireland': 'IRL',
  'Japan': 'JPN',
  'Malaysia': 'MYS',
  'Morocco': 'MAR',
  'Nepal': 'NPL',
  'Netherlands': 'NLD',
  'Norway': 'NOR',
  'Palestine': 'PSE',
  'Poland': 'POL',
  'Senegal': 'SEN',
  'South Korea': 'KOR',
  'South Sudan': 'SSD',
  'Sweden': 'SWE',
  'Switzerland': 'CHE',
  'United States': 'USA',
  'Vatican': 'VAT',
  'Venezuela': 'VEN',
};

// Function to get ISO code for a country name
export const getCountryISO = (countryName: string): string => {
  return countryToISO[countryName] || countryName; // Fallback to original name if no mapping exists
}; 
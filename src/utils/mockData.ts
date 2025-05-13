// Sample news data for the prototype
export interface StoryLocation {
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface NewsStory {
  id: string;
  title: string;
  category:
    | "sport"
    | "economie"
    | "klimaat"
    | "opmerkelijk"
    | "politiek"
    | "cultuur"
    | "rechtspraak"
    | "tech";
  locations: StoryLocation[]; // Replaces country and coordinates
  region: string; // This might be derived or represent a broader area
  imageUrl: string;
  summary?: string;
  fullText?: string; // Optional full article text
  date: string;
}

export const newsStories: NewsStory[] = [
  {
    id: "1",
    title:
      "Paus roept op tot vrijlating journalisten bij eerste ontmoeting met pers",
    category: "politiek",
    locations: [{ country: "Vatican", coordinates: [12.45, 41.9] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Paus Franciscus heeft opgeroepen tot de vrijlating van journalisten wereldwijd tijdens zijn eerste persontmoeting als nieuwe paus.",
    fullText:
      "Tijdens zijn eerste formele ontmoeting met duizenden journalisten van over de hele wereld, benadrukte Paus Franciscus het belang van een vrije en onafhankelijke pers. Hij sprak zijn zorgen uit over journalisten die gevangen zitten of onderdrukt worden vanwege hun werk en riep regeringen op hun rechten te respecteren. \n\nDe paus bedankte de media ook voor hun werk tijdens het conclaaf en vroeg om begrip voor de uitdagingen van zijn nieuwe rol. Hij sloot af met een zegen voor alle aanwezigen en hun families.",
    date: "2023-05-12",
  },
  {
    id: "2",
    title: "VN-voedselwaarschuwing: iedereen in Gaza riskeert hongersnood",
    category: "politiek",
    locations: [{ country: "Palestine", coordinates: [34.3, 31.4] }],
    region: "Middle East",
    imageUrl: "/placeholder.svg",
    summary:
      "De Verenigde Naties waarschuwen dat de gehele bevolking van Gaza hongersnood riskeert door aanhoudende conflicten en blokkades.",
    fullText:
      "De situatie in Gaza is kritiek, aldus de VN-rapporteur. Door de aanhoudende blokkades en recente escalaties is de toegang tot voedsel, water en medische hulp ernstig beperkt. \n\nHulporganisaties proberen noodhulp te bieden, maar de omvang van de crisis overstijgt de huidige capaciteit. Er is dringend internationale actie nodig om een humanitaire ramp af te wenden en duurzame oplossingen te vinden.",
    date: "2023-05-10",
  },
  {
    id: "3",
    title: "Spanningen tussen Polen en Rusland escaleren",
    category: "politiek",
    locations: [
      { country: "Poland", coordinates: [19.12, 52.22] },
      { country: "Russia", coordinates: [37.61, 55.75] }, // Moscow coordinates
    ],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Polen en Rusland beschuldigen elkaar wederzijds van provocaties aan de grens, wat leidt tot verhoogde militaire paraatheid.",
    date: "2023-05-09",
  },
  {
    id: "4",
    title:
      'Dankzij AI is leider Burkina Faso een hype op social media: "Hij heeft de vibe"',
    category: "tech",
    locations: [{ country: "Burkina Faso", coordinates: [-1.56, 12.36] }],
    region: "Africa",
    imageUrl: "/placeholder.svg",
    summary:
      "De leider van Burkina Faso is viral gegaan op sociale media dankzij AI-gegenereerde content die zijn charisma benadrukt.",
    date: "2023-05-08",
  },
  {
    id: "5",
    title:
      "Recordtemperaturen gemeten in Zuidelijke Oceaan door klimaatverandering",
    category: "klimaat",
    locations: [{ country: "Antarctica", coordinates: [0, -80] }],
    region: "Antarctica",
    imageUrl: "/placeholder.svg",
    summary:
      "Wetenschappers hebben alarmerende recordtemperaturen gemeten in de Zuidelijke Oceaan, met mogelijke gevolgen voor zeespiegelstijging.",
    fullText:
      "Metingen van onderzoeksschepen en satellieten tonen een ongekende opwarming van het oppervlaktewater rond Antarctica. Deze trend, direct gelinkt aan de wereldwijde klimaatverandering, bedreigt het delicate ecosysteem en versnelt het smelten van ijskappen. \n\nExperts waarschuwen voor de langetermijneffecten op de zeespiegel en het wereldwijde klimaatpatroon als deze trend doorzet. Het benadrukt de urgentie van internationale klimaatakkoorden.",
    date: "2023-05-11",
  },
  {
    id: "6",
    title: "Europese economie toont veerkracht ondanks inflatiedruk",
    category: "economie",
    locations: [{ country: "Germany", coordinates: [10.0, 51.0] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "De Europese economie blijkt veerkrachtig te zijn ondanks aanhoudende inflatiedruk en geopolitieke spanningen.",
    date: "2023-05-07",
  },
  {
    id: "7",
    title:
      "Nieuw festival viert culturele diversiteit in Aziatische gemeenschappen",
    category: "cultuur",
    locations: [{ country: "Thailand", coordinates: [100.5, 13.75] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "Een nieuw internationaal festival brengt diverse Aziatische culturele tradities samen in een maand van vieringen en uitwisselingen.",
    fullText:
      "Het 'Asian Cultures Connect' festival, dat plaatsvindt in Bangkok, biedt een platform voor artiesten, muzikanten en chefs uit heel Zuidoost-Azië. Bezoekers kunnen genieten van traditionele dansoptredens, hedendaagse kunstinstallaties en culinaire workshops. \n\nHet doel is om begrip en waardering voor de rijke culturele diversiteit van het continent te bevorderen en interculturele dialoog te stimuleren, aldus de organisatoren.",
    date: "2023-05-06",
  },
  {
    id: "8",
    title:
      "Doorbraak in kwantumcomputing bereikt door internationale samenwerking",
    category: "tech",
    locations: [{ country: "United States", coordinates: [-95.71, 37.09] }],
    region: "North America",
    imageUrl: "/placeholder.svg",
    summary:
      "Een internationaal team van wetenschappers heeft een significante doorbraak bereikt in kwantumcomputing door een nieuw type qubit te ontwikkelen.",
    date: "2023-05-05",
  },
  {
    id: "NEW1",
    title: "Nieuw Amazone-observatorium geopend in Brazilië",
    category: "klimaat",
    locations: [{ country: "Brazil", coordinates: [-55.0, -10.0] }],
    region: "South America",
    imageUrl: "/placeholder.svg",
    summary:
      "Brazilië opent een nieuw observatorium om ontbossing en klimaatverandering in het Amazonegebied te monitoren.",
    date: "2023-06-01",
  },
  {
    id: "17",
    title: "Eerste vrouwelijke president verkozen in Senegal",
    category: "politiek",
    locations: [{ country: "Senegal", coordinates: [-17.44, 14.69] }],
    region: "Africa",
    imageUrl: "/placeholder.svg",
    summary:
      "In een historische verkiezing is de eerste vrouwelijke president van Senegal verkozen, wat wereldwijd wordt geprezen als een doorbraak in gendergelijkheid.",
    date: "2023-04-26",
  },
  {
    id: "NEW2",
    title: "Australië investeert in koraalrifherstel Great Barrier Reef",
    category: "klimaat",
    locations: [{ country: "Australia", coordinates: [145.0, -18.0] }],
    region: "Oceania",
    imageUrl: "/placeholder.svg",
    summary:
      "De Australische overheid kondigt een groot investeringspakket aan voor het herstel van het Great Barrier Reef.",
    date: "2023-06-02",
  },
  {
    id: "18",
    title: "Internationale markt voor elektrische auto's groeit explosief",
    category: "economie",
    locations: [{ country: "Germany", coordinates: [13.4, 52.52] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "De verkoop van elektrische auto's is wereldwijd met 30% gestegen, met Duitsland als een van de grootste markten.",
    date: "2023-04-25",
  },
  {
    id: "19",
    title: "Aardbeving treft noordelijk Iran, honderden gewonden gemeld",
    category: "klimaat",
    locations: [{ country: "Iran", coordinates: [51.38, 35.68] }],
    region: "Middle East",
    imageUrl: "/placeholder.svg",
    summary:
      "Een aardbeving met een kracht van 6.1 op de schaal van Richter heeft het noorden van Iran getroffen, met schade aan infrastructuur en honderden gewonden.",
    date: "2023-04-24",
  },
  {
    id: "20",
    title: "Wereldwijd onderzoek gestart naar ethiek van gezichtsherkenning",
    category: "tech",
    locations: [{ country: "Sweden", coordinates: [18.06, 59.33] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Onder leiding van Zweedse onderzoekers is een wereldwijd onderzoek gestart naar de ethische implicaties van gezichtsherkenningstechnologie.",
    date: "2023-04-23",
  },
  {
    id: "NEW3",
    title: "DR Congo start campagne tegen ontbossing in Congobekken",
    category: "klimaat",
    locations: [{ country: "DR Congo", coordinates: [23.5, -2.0] }],
    region: "Africa",
    imageUrl: "/placeholder.svg",
    summary:
      "De Democratische Republiek Congo lanceert een nieuwe campagne om de ontbossing in het Congobekken tegen te gaan.",
    date: "2023-06-03",
  },
  {
    id: "21",
    title: "Nieuwe culturele hotspot opent in hartje Cairo",
    category: "cultuur",
    locations: [{ country: "Egypt", coordinates: [31.23, 30.04] }],
    region: "Africa",
    imageUrl: "/placeholder.svg",
    summary:
      "In Cairo is een moderne culturele hub geopend die kunst, muziek en educatie samenbrengt, met als doel jongeren aan te moedigen hun creativiteit te ontwikkelen.",
    date: "2023-04-22",
  },
  {
    id: "22",
    title:
      "Noorse wetenschappers ontdekken mogelijke remedie tegen zeldzame zenuwziekte",
    category: "tech",
    locations: [{ country: "Norway", coordinates: [10.75, 59.91] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Een onderzoeksteam in Noorwegen heeft een potentieel medicijn ontwikkeld voor een zeldzame genetische zenuwziekte, dat nu klinisch getest wordt.",
    date: "2023-04-21",
  },
  {
    id: "23",
    title: "India lanceert grootste hernieuwbare energieproject ooit",
    category: "klimaat",
    locations: [{ country: "India", coordinates: [77.21, 28.61] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "India investeert miljarden in een nieuw zonne- en windenergieproject in de Tharwoestijn, met als doel de uitstoot drastisch te verlagen.",
    date: "2023-04-20",
  },
  {
    id: "24",
    title: "Economisch herstel in Argentinië blijft fragiel ondanks IMF-steun",
    category: "economie",
    locations: [{ country: "Argentina", coordinates: [-58.42, -34.61] }],
    region: "South America",
    imageUrl: "/placeholder.svg",
    summary:
      "Ondanks financiële steun van het IMF blijft het economische herstel in Argentinië onzeker, met hoge inflatie en beperkte koopkracht.",
    date: "2023-04-19",
  },
  {
    id: "9",
    title:
      "Zuid-Koreaanse jongeren protesteren tegen werkdruk en onderwijssysteem",
    category: "cultuur",
    locations: [{ country: "South Korea", coordinates: [126.98, 37.56] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "Duizenden Zuid-Koreaanse jongeren gingen de straat op in Seoul om te protesteren tegen de hoge werkdruk en prestatiedruk binnen het onderwijs.",
    date: "2023-05-04",
  },
  {
    id: "10",
    title: "Nederland kondigt nieuwe windparken op Noordzee aan",
    category: "klimaat",
    locations: [{ country: "Netherlands", coordinates: [4.9, 52.37] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "De Nederlandse regering investeert in meerdere nieuwe windparken op de Noordzee om de energietransitie te versnellen.",
    date: "2023-05-03",
  },
  {
    id: "11",
    title:
      "Historische vredesdeal bereikt tussen Colombiaanse regering en rebellen",
    category: "politiek",
    locations: [{ country: "Colombia", coordinates: [-74.07, 4.61] }],
    region: "South America",
    imageUrl: "/placeholder.svg",
    summary:
      "Na jaren van conflict hebben de Colombiaanse regering en rebellen een historische vredesovereenkomst getekend in Bogotá.",
    date: "2023-05-02",
  },
  {
    id: "12",
    title: "Dreigende droogte in Australië zet landbouwsector onder druk",
    category: "klimaat",
    locations: [{ country: "Australia", coordinates: [149.13, -35.28] }],
    region: "Oceania",
    imageUrl: "/placeholder.svg",
    summary:
      "Een toenemende droogte in Australië leidt tot zorgen binnen de landbouwsector over oogstverliezen en voedselvoorziening.",
    date: "2023-05-01",
  },
  {
    id: "13",
    title: "Toerisme in Marokko herstelt snel na pandemie",
    category: "economie",
    locations: [{ country: "Morocco", coordinates: [-6.84, 34.02] }],
    region: "Africa",
    imageUrl: "/placeholder.svg",
    summary:
      "De toeristische sector in Marokko laat een sterk herstel zien na de pandemie, met een recordaantal internationale bezoekers.",
    date: "2023-04-30",
  },
  {
    id: "14",
    title: "Nieuwe AI-wetgeving in Canada roept vragen op bij techbedrijven",
    category: "tech",
    locations: [{ country: "Canada", coordinates: [-75.69, 45.42] }],
    region: "North America",
    imageUrl: "/placeholder.svg",
    summary:
      "Canada stelt nieuwe regelgeving voor rondom het gebruik van AI, wat leidt tot bezorgdheid bij technologiebedrijven over innovatiebeperkingen.",
    date: "2023-04-29",
  },
  {
    id: "15",
    title: "Internationale dansdag gevierd met optredens in 40 landen",
    category: "cultuur",
    locations: [{ country: "Brazil", coordinates: [-43.17, -22.91] }],
    region: "South America",
    imageUrl: "/placeholder.svg",
    summary:
      "Op Internationale Dansdag kwamen artiesten wereldwijd samen om via dans culturele expressie en verbondenheid te vieren.",
    date: "2023-04-28",
  },
  {
    id: "16",
    title:
      "Techgigant lanceert satellietnetwerk voor internet in afgelegen gebieden",
    category: "tech",
    locations: [{ country: "China", coordinates: [116.4, 39.9] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "Een Chinees technologiebedrijf heeft een wereldwijd satellietnetwerk gelanceerd om internettoegang in afgelegen gebieden te verbeteren.",
    date: "2023-04-27",
  },
  {
    id: "51",
    title: "VN-top bespreekt gevolgen van smeltende gletsjers in Himalaya",
    category: "klimaat",
    locations: [{ country: "Nepal", coordinates: [85.32, 27.71] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "Tijdens een VN-conferentie in Kathmandu werden zorgen geuit over de versnelde smelting van gletsjers en de gevolgen voor miljoenen mensen in de regio.",
    date: "2023-04-18",
  },
  {
    id: "52",
    title: "België voert extra belasting in op digitale diensten",
    category: "economie",
    locations: [{ country: "Belgium", coordinates: [4.35, 50.85] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "De Belgische regering voert een nieuwe belasting in op grote techbedrijven die digitale diensten aanbieden binnen het land.",
    date: "2023-04-17",
  },
  {
    id: "53",
    title:
      "Nieuwe kunstmatige intelligentie schrijft poëzie in lokale dialecten",
    category: "tech",
    locations: [{ country: "Ireland", coordinates: [-6.26, 53.35] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Een Iers onderzoekscentrum heeft een AI ontwikkeld die poëzie kan genereren in meerdere Ierse dialecten, wat gezien wordt als een stap richting cultuurbehoud.",
    date: "2023-04-16",
  },
  {
    id: "54",
    title: "Vrouwenteam uit Afghanistan wint internationale sportprijs",
    category: "sport",
    locations: [{ country: "Afghanistan", coordinates: [69.17, 34.53] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "Een Afghaans vrouwenteam is internationaal onderscheiden voor hun doorzettingsvermogen en prestaties in de sportwereld ondanks moeilijke omstandigheden.",
    date: "2023-04-15",
  },
  {
    id: "55",
    title: "Zuid-Soedan plant grootste herbebossingsproject ooit in regio",
    category: "klimaat",
    locations: [{ country: "South Sudan", coordinates: [31.58, 4.85] }],
    region: "Africa",
    imageUrl: "/placeholder.svg",
    summary:
      "Zuid-Soedan start met het planten van miljoenen bomen in een poging om landdegradatie en droogte tegen te gaan.",
    date: "2023-04-14",
  },
  {
    id: "56",
    title: "Estland digitaliseert volledige gezondheidszorgsysteem",
    category: "tech",
    locations: [{ country: "Estonia", coordinates: [24.75, 59.44] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Estland loopt voorop in digitalisering en heeft nu het volledige gezondheidszorgsysteem gedigitaliseerd, inclusief patiëntendossiers.",
    date: "2023-03-09",
  },
  {
    id: "57",
    title: "Internationale kritiek op gevangenisomstandigheden in Venezuela",
    category: "politiek",
    locations: [{ country: "Venezuela", coordinates: [-66.9, 10.49] }],
    region: "South America",
    imageUrl: "/placeholder.svg",
    summary:
      "Mensenrechtenorganisaties luiden de noodklok over de mensonterende omstandigheden in Venezolaanse gevangenissen.",
    date: "2023-04-12",
  },
  {
    id: "58",
    title: "Vergeten talen herleven via virtual reality in Bolivia",
    category: "cultuur",
    locations: [{ country: "Bolivia", coordinates: [-68.12, -16.5] }],
    region: "South America",
    imageUrl: "/placeholder.svg",
    summary:
      "Een Boliviaans museum gebruikt VR-technologie om bezoekers onder te dompelen in uitgestorven talen en culturen van de Andes.",
    date: "2023-04-11",
  },
  {
    id: "59",
    title: "Nieuw vaccin tegen dengue getest in Maleisië",
    category: "tech",
    locations: [{ country: "Malaysia", coordinates: [101.69, 3.14] }],
    region: "Asia",
    imageUrl: "/placeholder.svg",
    summary:
      "Wetenschappers in Maleisië testen een nieuw vaccin tegen dengue, een virus dat jaarlijks miljoenen treft in tropische gebieden.",
    date: "2023-04-10",
  },
  {
    id: "60",
    title: "Zwitserland organiseert referendum over AI-regulering",
    category: "politiek",
    locations: [{ country: "Switzerland", coordinates: [8.54, 47.37] }],
    region: "Europe",
    imageUrl: "/placeholder.svg",
    summary:
      "Zwitserland houdt een nationaal referendum over de regulering van kunstmatige intelligentie, waarbij privacy en transparantie centraal staan.",
    date: "2023-04-09",
  },
];

export const categories = [
  { id: "cultuur", name: "Cultuur" },
  { id: "economie", name: "Economie" },
  { id: "klimaat", name: "Klimaat" },
  { id: "opmerkelijk", name: "Opmerkelijk" },
  { id: "politiek", name: "Politiek" },
  { id: "sport", name: "Sport" },
  { id: "tech", name: "Tech" },
];

export const getStoriesByCategory = (categoryId: string | null) => {
  if (!categoryId) return newsStories;
  return newsStories.filter((story) => story.category === categoryId);
};

export const getStoriesBySearch = (query: string) => {
  const lowerCaseQuery = query.toLowerCase();
  return newsStories.filter(
    (story) =>
      story.title.toLowerCase().includes(lowerCaseQuery) ||
      story.locations.some((loc) =>
        loc.country.toLowerCase().includes(lowerCaseQuery)
      ) ||
      story.summary.toLowerCase().includes(lowerCaseQuery)
  );
};

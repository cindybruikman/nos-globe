import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

import wereld from "@/assets/data/world.json";
import { NewsStory } from "@/utils/mockData";
import { getCountryColor } from "@/utils/countryColors";
import { getCountryISO } from "@/utils/countryMapping";

const sensitivity = 50;

// Define TypeScript types
interface CountryFeature {
  id: string;
  [key: string]: any;
}

interface WorldGeoJSON {
  features: CountryFeature[];
}

interface TheWorldProps {
  width: number;
  height: number;
  openModal: (data: {
    prismic: any;
    color: string;
    type: string;
    icon: string;
  }) => void;
  stories: NewsStory[];
  focusedCoordinates: [number, number] | null;
  highlightedCountryIds: string[] | null;
  onVisibleStoriesChange: (visibleIds: string[]) => void;
  renderableStoryIds?: string[];
}

export const TheWorld: React.FC<TheWorldProps> = ({
  width,
  height,
  openModal,
  stories,
  focusedCoordinates,
  highlightedCountryIds,
  onVisibleStoriesChange,
  renderableStoryIds,
}) => {
  const [allSvgPaths, setAllSvgPaths] = useState<JSX.Element[]>([]);
  const [allPointPaths, setAllPointPaths] = useState<JSX.Element[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const globeRef = useRef<SVGCircleElement | null>(null);
  const timerRef = useRef<boolean>(false);

  const storiesRef = useRef(stories);
  useEffect(() => { storiesRef.current = stories; }, [stories]);

  const openModalRef = useRef(openModal);
  useEffect(() => { openModalRef.current = openModal; }, [openModal]);
  
  const highlightedCountryIdsRef = useRef(highlightedCountryIds);

  // Define projection and path first as calcCountryPaths depends on them
  const projection = useRef(
    d3.geoOrthographic()
      .scale(330)
      .center([0, 0])
      .rotate([0, -15])
      .translate([width / 2, height / 2])
  ).current;

  const initialScale = useRef(projection.scale()).current; // Depends on projection
  const path = useRef(d3.geoPath().projection(projection)).current; // Depends on projection

  const [currentGlobeRadius, setCurrentGlobeRadius] = useState(initialScale);

  const calcCountryPaths = useCallback(() => {
    const currentHighlightedCountryIds = highlightedCountryIdsRef.current;
    const paths = (wereld as WorldGeoJSON).features.map((countryFeature) => {
      let fillColor = "#949494"; // Default color
      
      const countryNameFromGeoJSON = countryFeature.properties.name;
      const featureIso = getCountryISO(countryNameFromGeoJSON);

      if (currentHighlightedCountryIds && featureIso && currentHighlightedCountryIds.includes(featureIso)) {
        fillColor = getCountryColor(featureIso);
      }

      return (
        <path
          key={countryFeature.id || countryNameFromGeoJSON}
          d={path(countryFeature) || undefined}
          fill={fillColor}
          stroke="white"
          strokeWidth={0.3}
        />
      );
    });
    setAllSvgPaths(paths);
  }, [path, getCountryISO, getCountryColor]); // path is a dependency

  useEffect(() => {
    highlightedCountryIdsRef.current = highlightedCountryIds;
    // path check is good, as calcCountryPaths depends on it.
    // If path isn't ready, calcCountryPaths shouldn't run.
    if (path) { 
        calcCountryPaths();
    }
  }, [highlightedCountryIds, calcCountryPaths, path]);

  const resolveCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case "politiek": return "politiek-rood";
      case "klimaat": return "klimaat-blauw";
      case "economie": return "economie-geel";
      case "cultuur": return "cultuur-oranje";
      case "techniek": case "tech": return "techniek-groen";
      case "sport": return "politiek-rood";
      case "opmerkelijk": return "cultuur-oranje";
      case "rechtspraak": return "default-rood";
      default: return "default-rood";
    }
  }, []);

  const [mapInteractionCounter, setMapInteractionCounter] = useState(0);
  const incrementMapInteraction = () => setMapInteractionCounter(c => c + 1);

  useEffect(() => {
    const currentStoriesForGlobe = storiesRef.current;
    const visibleStoryIdsSet = new Set<string>();
    if (currentStoriesForGlobe) {
        currentStoriesForGlobe.forEach((story) => {
            if (story.locations && story.locations.length > 0) {
                for (const location of story.locations) {
                    const coords = projection(location.coordinates);
                    if (coords && coords[0] >= 0 && coords[0] <= width && coords[1] >= 0 && coords[1] <= height) {
                        visibleStoryIdsSet.add(story.id);
                        break;
                    }
                }
            }
        });
    }
    onVisibleStoriesChange(Array.from(visibleStoryIdsSet));
  }, [storiesRef.current, width, height, projection, onVisibleStoriesChange, mapInteractionCounter]);

  useEffect(() => {
    const elements: JSX.Element[] = [];
    const currentStoriesForGlobe = storiesRef.current;
    const defaultDotColor = "#808080";

    if (currentStoriesForGlobe && renderableStoryIds) {
        currentStoriesForGlobe.forEach((story) => {
            if (renderableStoryIds.includes(story.id) && story.locations) {
                story.locations.forEach((location, index) => {
                    const coords = projection(location.coordinates);
                    if (coords && coords[0] >= 0 && coords[0] <= width && coords[1] >= 0 && coords[1] <= height) {
                        const countryISO = getCountryISO(location.country);
                        const dotColor = countryISO ? getCountryColor(countryISO) : defaultDotColor;
                        
                        elements.push(
                            <circle
                                key={`${story.id}-${index}`}
                                cx={coords[0]}
                                cy={coords[1]}
                                r={7}
                                fill={dotColor}
                                className="cursor-pointer story-dot"
                                tabIndex={0}
                                aria-label={`${story.title} (${location.country})`}
                                onClick={() =>
                                    openModalRef.current({
                                        prismic: story.id,
                                        color: story.category,
                                        type: story.title,
                                        icon: resolveCategoryIcon(story.category),
                                    })
                                }
                            />
                        );
                    }
                });
            }
        });
    }
    setAllPointPaths(elements);
  }, [renderableStoryIds, storiesRef.current, width, height, projection, resolveCategoryIcon, openModalRef, mapInteractionCounter, getCountryISO, getCountryColor]);

  const setRotationTimer = () => {
    let rotationTimer = d3.timer(() => {
      if (timerRef.current) {
        rotationTimer.stop();
        return;
      }
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] - 1 * k * -1, rotate[1]]);
      calcCountryPaths();
      incrementMapInteraction();
    }, 200);
  };

  const drawGlobe = () => {
    const svg = d3.select(svgRef.current);
    const globe = d3.select(globeRef.current);

    svg.call(
        d3.drag<SVGSVGElement, unknown>()
          .on("start", () => { timerRef.current = true; svg.interrupt("zoom"); })
          .on("drag", (e) => {
            const rotate = projection.rotate();
            const k = sensitivity / projection.scale();
            projection.rotate([rotate[0] + e.dx * k, rotate[1] - e.dy * k]);
            calcCountryPaths();
            incrementMapInteraction();
          })
          .on("end", () => { /* No auto-restart */ })
      )
      .call(
        d3.zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
          if (e.transform.k > 0.3) {
            projection.scale(initialScale * e.transform.k);
            const newRadius = projection.scale();
            globe.attr("r", newRadius);
            setCurrentGlobeRadius(newRadius);
            calcCountryPaths();
            incrementMapInteraction();
          } else {
            e.transform.k = 0.3;
          }
        })
      );
  };

  useEffect(() => {
    if (focusedCoordinates) {
      const targetRotation: [number, number] = [-focusedCoordinates[0], -focusedCoordinates[1]];
      const targetScale = initialScale * 8;
      timerRef.current = true;

      d3.select(svgRef.current)
        .transition()
        .duration(1000)
        .tween("rotate", () => {
          const r = d3.interpolate(projection.rotate(), targetRotation);
          const s = d3.interpolate(projection.scale(), targetScale);
          return (t) => {
            projection.rotate(r(t));
            projection.scale(s(t));
            const newRadius = projection.scale();
            d3.select(globeRef.current).attr("r", newRadius);
            setCurrentGlobeRadius(newRadius);
            calcCountryPaths();
            incrementMapInteraction();
          };
        })
        .on("end", () => {
            incrementMapInteraction();
        });
    } else {
      timerRef.current = true;
      const defaultRotation: [number, number] = [0, -15];

      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .tween("rotate.reset", () => {
          const r = d3.interpolate(projection.rotate(), defaultRotation);
          const s = d3.interpolate(projection.scale(), initialScale);
          return (t) => {
            projection.rotate(r(t));
            projection.scale(s(t));
            const newRadius = projection.scale();
            d3.select(globeRef.current).attr("r", newRadius);
            setCurrentGlobeRadius(newRadius);
            calcCountryPaths();
            incrementMapInteraction();
          };
        })
        .on("end", () => {
          timerRef.current = false;
          incrementMapInteraction();
        });
    }
  }, [focusedCoordinates, projection, initialScale, calcCountryPaths, width, height]);

  useEffect(() => {
    calcCountryPaths();
    drawGlobe();
    setRotationTimer();
    incrementMapInteraction();
  }, [width, height, projection]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="afbeelding van de wereld"
    >
      <defs>
        {/* Category icons */}
        <g id="politiek-rood">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="24">P</text>
        </g>
        <g id="klimaat-blauw">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="24">K</text>
        </g>
        <g id="economie-geel">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="24">E</text>
        </g>
        <g id="cultuur-oranje">
          <circle cx="50" cy="50" r="50" fill="#ff8c00" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="24">C</text>
        </g>
        <g id="techniek-groen">
          <circle cx="50" cy="50" r="50" fill="#4caf50" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="24">T</text>
        </g>
        <g id="default-rood">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="24">?</text>
        </g>
        <clipPath id="globeClipPath">
          <circle
            cx={width / 2}
            cy={height / 2}
            r={currentGlobeRadius}
          />
        </clipPath>
      </defs>
      
      <circle
        id="globe"
        ref={globeRef}
        fill="#e6e6e6"
        stroke="#1E1E1E"
        strokeWidth={0.2}
        cx={width / 2}
        cy={height / 2}
        r={initialScale}
      ></circle>
      <g className="countries" clipPath="url(#globeClipPath)">{allSvgPaths}</g>
      <g clipPath="url(#globeClipPath)">{allPointPaths}</g>
    </svg>
  );
};

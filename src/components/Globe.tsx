import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

import wereld from "@/assets/data/world.json";
import { NewsStory } from "@/utils/mockData";

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
  highlightedCountryId: string | null;
}

export const TheWorld: React.FC<TheWorldProps> = ({
  width,
  height,
  openModal,
  stories,
  focusedCoordinates,
  highlightedCountryId,
}) => {
  const [allSvgPaths, setAllSvgPaths] = useState<JSX.Element[]>([]);
  const [allPointPaths, setAllPointPaths] = useState<JSX.Element[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const globeRef = useRef<SVGCircleElement | null>(null);
  const timerRef = useRef<boolean>(false);

  // Refs for props that might go stale in D3 event handlers
  const storiesRef = useRef(stories);
  useEffect(() => { storiesRef.current = stories; }, [stories]);

  const highlightedCountryIdRef = useRef(highlightedCountryId);
  useEffect(() => { highlightedCountryIdRef.current = highlightedCountryId; }, [highlightedCountryId]);

  const openModalRef = useRef(openModal);
  useEffect(() => { openModalRef.current = openModal; }, [openModal]);

  const projection = useRef(
    d3.geoOrthographic()
      .scale(250)
      .center([0, 0])
      .rotate([0, -15])
      .translate([width / 2, height / 2])
  ).current;

  const initialScale = useRef(projection.scale()).current;
  const path = useRef(d3.geoPath().projection(projection)).current;
  const pointPath = d3.geoPath().projection(projection).pointRadius(10);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case "politiek":
        return "politiek-rood";
      case "klimaat":
        return "klimaat-blauw";
      case "economie":
        return "economie-geel";
      case "cultuur":
        return "cultuur-oranje";
      case "techniek":
      case "tech":
        return "techniek-groen";
      case "sport":
        return "politiek-rood";
      case "opmerkelijk":
        return "cultuur-oranje";
      case "rechtspraak":
        return "default-rood";
      default:
        return "default-rood";
    }
  }, []);

  const calcCountryPaths = useCallback(() => {
    const currentHighlightedCountryId = highlightedCountryIdRef.current;
    const paths = (wereld as WorldGeoJSON).features.map((country) => (
      <path
        key={country.id}
        d={path(country) || undefined}
        fill={
          currentHighlightedCountryId === country.id ? "#FFD700" : "#949494"
        }
        stroke="white"
        strokeWidth={0.3}
      />
    ));
    setAllSvgPaths(paths);
  }, [path]);

  const calcPointPaths = useCallback(() => {
    const currentStories = storiesRef.current;
    const currentOpenModal = openModalRef.current;

    const points = currentStories.map((story) => {
      const coords = projection(story.coordinates);
      if (coords) {
        return (
          <use
            tabIndex={0}
            aria-label={story.title}
            key={story.id}
            className="cursor-pointer"
            xlinkHref={`#${getCategoryIcon(story.category)}`}
            x={coords[0] * 3}
            y={coords[1] * 3}
            transform="scale(0.33)"
            onClick={() =>
              currentOpenModal({
                prismic: story.id,
                color: story.category,
                type: story.title,
                icon: getCategoryIcon(story.category),
              })
            }
          />
        );
      }
      return null;
    });
    setAllPointPaths(points.filter((p): p is JSX.Element => p !== null));
  }, [getCategoryIcon, projection]);

  const setRotationTimer = () => {
    let rotationTimer = d3.timer((elapsed) => {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] - 1 * k * -1, rotate[1]]);
      calcCountryPaths();
      calcPointPaths();
      if (timerRef.current) rotationTimer.stop();
    }, 200);
  };

  const drawGlobe = () => {
    const svg = d3.select(svgRef.current);
    const globe = d3.select(globeRef.current);

    svg
      .call(
        d3.drag<SVGSVGElement, unknown>().on("drag", (e) => {
          timerRef.current = true;
          const rotate = projection.rotate();
          const k = sensitivity / projection.scale();
          projection.rotate([rotate[0] + e.dx * k, rotate[1] - e.dy * k]);
          calcCountryPaths();
          calcPointPaths();
        })
      )
      .call(
        d3.zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
          if (e.transform.k > 0.3) {
            projection.scale(initialScale * e.transform.k);
            calcCountryPaths();
            calcPointPaths();
            globe.attr("r", projection.scale());
          } else {
            e.transform.k = 0.3;
          }
        })
      );
  };

  useEffect(() => {
    if (focusedCoordinates) {
      const targetRotation: [number, number] = [
        -focusedCoordinates[0],
        -focusedCoordinates[1],
      ];
      const targetScale = initialScale * 3;

      d3.select(svgRef.current)
        .transition()
        .duration(1000)
        .tween("rotate", () => {
          const r = d3.interpolate(projection.rotate(), targetRotation);
          const s = d3.interpolate(projection.scale(), targetScale);
          return (t) => {
            projection.rotate(r(t));
            projection.scale(s(t));
            calcCountryPaths();
            calcPointPaths();
            d3.select(globeRef.current).attr("r", projection.scale());
          };
        });
      timerRef.current = true;
    } else {
      // Optional: Reset view if no coordinates are focused
      // Or start auto-rotation again if desired
      // timerRef.current = false;
      // setRotationTimer();
    }
  }, [focusedCoordinates]);

  useEffect(() => {
    calcPointPaths();
    calcCountryPaths();
    drawGlobe();
    setRotationTimer();
  }, [height, width]);

  // Add effect to update points when stories change
  useEffect(() => {
    calcPointPaths();
  }, [stories]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
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
      <g className="countries">{allSvgPaths}</g>
      <g>{allPointPaths}</g>
    </svg>
  );
};

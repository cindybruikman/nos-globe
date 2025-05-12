import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import wereld from "@/assets/data/world.json";
import punten from "@/assets/data/punten_rapporten.json";

const sensitivity = 50;

// Define TypeScript types
interface CountryFeature {
  id: string;
  [key: string]: any;
}

interface PuntFeature {
  type: string;
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    id?: string;
    fid: string;
    prismic: any;
    color: string;
    type: string;
    icon: string;
  };
  [key: string]: any;
}

interface WorldGeoJSON {
  features: CountryFeature[];
}

interface PuntGeoJSON {
  features: PuntFeature[];
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
}

export const TheWorld: React.FC<TheWorldProps> = ({
  width,
  height,
  openModal,
}) => {
  const [allSvgPaths, setAllSvgPaths] = useState<JSX.Element[]>([]);
  const [allPointPaths, setAllPointPaths] = useState<JSX.Element[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const globeRef = useRef<SVGCircleElement | null>(null);
  const timerRef = useRef<boolean>(false);

  const projection = d3
    .geoOrthographic()
    .scale(250)
    .center([0, 0])
    .rotate([0, -15])
    .translate([width / 2, height / 2]);

  const initialScale = projection.scale();
  const path = d3.geoPath().projection(projection);
  const pointPath = d3.geoPath().projection(projection).pointRadius(10);

  const calcCountryPaths = () => {
    const paths = (wereld as WorldGeoJSON).features.map((country) => (
      <path
        key={country.id}
        d={path(country) || undefined}
        fill="#949494"
        stroke="white"
        strokeWidth={0.3}
      />
    ));
    setAllSvgPaths(paths);
  };

  const calcPointPaths = () => {
    const points = (punten as PuntGeoJSON).features.map((punt) => {
      const coords = projection(punt.geometry.coordinates);
      if (coords && pointPath(punt) !== null) {
        return (
          <use
            tabIndex={0}
            aria-label={punt.properties.type}
            key={punt.properties.fid}
            className="cursor-pointer"
            xlinkHref={`#${punt.properties.icon}`}
            x={coords[0] * 3}
            y={coords[1] * 3}
            transform="scale(0.33)"
            onClick={() =>
              openModal({
                prismic: punt.properties.prismic,
                color: punt.properties.color,
                type: punt.properties.type,
                icon: punt.properties.icon,
              })
            }
          />
        );
      }
      return null;
    });
    setAllPointPaths(points.filter((p): p is JSX.Element => p !== null));
  };

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
    calcPointPaths();
    calcCountryPaths();
    drawGlobe();
    setRotationTimer();
  }, [height, width]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="afbeelding van de wereld"
    >
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

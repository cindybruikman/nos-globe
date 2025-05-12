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
    type: string;
    coordinates: number[];
  };
  properties: {
    id?: string;
    fid: number;
    lon?: number;
    lat?: number;
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
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    }
  };
}

interface TheWorldProps {
  width: number;
  height: number;
  zoomTargetCountry: string | null;
  openModal: (data: {
    prismic: any;
    color: string;
    type: string;
    icon: string;
  }) => void;
  onVisibleCountriesChange?: (countries: string[]) => void;
}

export const TheWorld: React.FC<TheWorldProps> = ({
  width,
  height,
  openModal,
  zoomTargetCountry,
  onVisibleCountriesChange,
}) => {
  const [allSvgPaths, setAllSvgPaths] = useState<JSX.Element[]>([]);
  const [allPointPaths, setAllPointPaths] = useState<JSX.Element[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const globeRef = useRef<SVGCircleElement | null>(null);
  const timerRef = useRef<boolean>(false);
  // Refs for zooming functionality
  const prevRotationRef = useRef<[number, number, number]>([0, -15, 0]);
  const prevScaleRef = useRef<number>(250);
  const isManualInteractionRef = useRef<boolean>(false);
  const zoomTransitionRef = useRef<d3.Transition<SVGSVGElement, unknown, null, undefined> | null>(null);
  const [visibleCountries, setVisibleCountries] = useState<string[]>([]);
  // State to hold the calculated visible countries before debouncing
  const [calculatedVisibleCountries, setCalculatedVisibleCountries] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const projection = d3
    .geoOrthographic()
    .scale(250)
    .center([0, 0])
    .rotate([0, -15])
    .translate([width / 2, height / 2]);

  const initialScale = projection.scale();
  const path = d3.geoPath().projection(projection);
  const pointPath = d3.geoPath().projection(projection).pointRadius(10);

  // Calculate centroid of a country by name
  const getCountryCentroid = (countryName: string): [number, number] | null => {
    const country = (wereld as WorldGeoJSON).features.find(
      (c) => c.properties.name === countryName
    );
    if (!country) return null;
    
    return d3.geoCentroid(country as d3.GeoPermissibleObjects);
  };

  const updateVisibleCountries = () => {
    // Get the current projection parameters
    const currentRotation = projection.rotate();
    const currentScale = projection.scale();
    
    // Calculate the threshold angle based on scale (smaller at higher zoom)
    const visibilityThreshold = 90 * (initialScale / currentScale);
    
    // Determine which countries are visible
    const visible = (wereld as WorldGeoJSON).features
      .filter(country => {
        // Get country centroid
        const centroid = d3.geoCentroid(country as d3.GeoPermissibleObjects);
        
        // Convert centroid to screen coordinates
        const lambda = centroid[0] + currentRotation[0];
        const phi = centroid[1] + currentRotation[1];
        
        // Calculate angular distance from the center of the view
        // Using the great circle distance formula
        const distance = Math.acos(
          Math.sin(phi * Math.PI / 180) * Math.sin(-currentRotation[1] * Math.PI / 180) +
          Math.cos(phi * Math.PI / 180) * Math.cos(-currentRotation[1] * Math.PI / 180) *
          Math.cos((lambda - (-currentRotation[0])) * Math.PI / 180)
        ) * 180 / Math.PI;
        
        // A country is visible if its centroid is less than the threshold angle from view center
        return distance < visibilityThreshold;
      })
      .map(country => country.properties.name);
    
    // Update the intermediate state immediately
    if (JSON.stringify(visible) !== JSON.stringify(calculatedVisibleCountries)) {
      setCalculatedVisibleCountries(visible);
    }
  };

  // Debounce the actual update to the parent component
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Only update parent if the debounced value differs from the current parent state
      // This check might be redundant depending on how Index uses the prop, but can prevent unnecessary updates
      if (JSON.stringify(calculatedVisibleCountries) !== JSON.stringify(visibleCountries)) {
        setVisibleCountries(calculatedVisibleCountries);
        if (onVisibleCountriesChange) {
          onVisibleCountriesChange(calculatedVisibleCountries);
        }
      }
    }, 300); // 300ms debounce delay

    // Cleanup timer on component unmount or before next effect run
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  // Depend on the calculated state and the callback prop
  }, [calculatedVisibleCountries, onVisibleCountriesChange, visibleCountries]); 

  const calcCountryPaths = () => {
    const paths = (wereld as WorldGeoJSON).features.map((country) => (
      <path
        key={country.id}
        d={path(country) || undefined}
        fill={country.properties.name === zoomTargetCountry ? "#ffcc00" : "#949494"}
        stroke="white"
        strokeWidth={0.3}
        className="country-path"
      />
    ));
    setAllSvgPaths(paths);
    
    // Update visible countries after recalculating paths
    updateVisibleCountries();
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
      if (timerRef.current) {
        rotationTimer.stop();
        return;
      }
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] - 1 * k * -1, rotate[1]]);
      calcCountryPaths();
      calcPointPaths();
    }, 200);
  };

  const drawGlobe = () => {
    const svg = d3.select(svgRef.current);
    const globe = d3.select(globeRef.current);

    svg
      .call(
        d3.drag<SVGSVGElement, unknown>()
          .on("start", (event) => {
            timerRef.current = true; // Stop auto-rotation on drag start
            isManualInteractionRef.current = true;
            svg.interrupt("zoom"); // Interrupt any ongoing zoom transition
          })
          .on("drag", (e) => {
            const rotate = projection.rotate();
            const k = sensitivity / projection.scale();
            projection.rotate([rotate[0] + e.dx * k, rotate[1] - e.dy * k]);
            prevRotationRef.current = projection.rotate() as [number, number, number]; // Store rotation
            calcCountryPaths();
            calcPointPaths();
            // Don't update visible countries on every drag frame for performance
          })
          .on("end", (event) => {
            isManualInteractionRef.current = false;
            // DO NOT restart rotation here. Let the zoom-out transition handle it.
            updateVisibleCountries(); // Update (debounced) visible countries once drag ends
          })
      )
      .call(
        d3.zoom<SVGSVGElement, unknown>()
          .on("start", (event) => {
            timerRef.current = true; // Stop auto-rotation on zoom start
            isManualInteractionRef.current = true;
            svg.interrupt("zoom"); // Interrupt any ongoing zoom transition
          })
          .on("zoom", (e) => {
            if (e.transform.k > 0.3) {
              projection.scale(initialScale * e.transform.k);
              prevScaleRef.current = projection.scale(); // Store scale
              calcCountryPaths();
              calcPointPaths();
              globe.attr("r", projection.scale());
              // Don't update visible countries on every zoom frame for performance
            } else {
              e.transform.k = 0.3; // Prevent zooming out too much
            }
          })
          .on("end", (event) => {
            isManualInteractionRef.current = false;
            // DO NOT restart rotation here. Let the zoom-out transition handle it.
            updateVisibleCountries(); // Update (debounced) visible countries once zoom ends
          })
      );
  };

  // Handle zoom to country when hovering on news article
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    svg.interrupt("zoom");

    if (zoomTargetCountry) {
      const centroid = getCountryCentroid(zoomTargetCountry);
      if (!centroid) return;

      if (!zoomTransitionRef.current) {
        prevRotationRef.current = projection.rotate() as [number, number, number];
        prevScaleRef.current = projection.scale();
      }

      timerRef.current = true;
      isManualInteractionRef.current = false;

      const targetRotation: [number, number, number] = [-centroid[0], -centroid[1], 0];
      const targetScale = initialScale * 2.5;

      const globe = d3.select(globeRef.current);

      const zoomInTransition = svg
        .transition("zoom")
        .duration(1000)
        .ease(d3.easeQuadInOut);

      zoomTransitionRef.current = zoomInTransition;

      let interpolateRotation = d3.interpolate(projection.rotate(), targetRotation);
      let interpolateScale = d3.interpolateNumber(projection.scale(), targetScale);

      zoomInTransition
        .tween("rotate", () => {
          return (t) => {
            projection.rotate(interpolateRotation(t));
            projection.scale(interpolateScale(t));
            globe.attr("r", projection.scale());
            calcCountryPaths();
            calcPointPaths();
            // REMOVED updateVisibleCountries() from here
          };
        })
        .on("end interrupt", () => {
          zoomTransitionRef.current = null;
          updateVisibleCountries(); // Update (debounced) visible countries on transition end/interrupt
          // Don't restart rotation after zooming IN
        });

    } else {
      if (prevRotationRef.current && prevScaleRef.current) {
        timerRef.current = true;
        isManualInteractionRef.current = false;

        const targetRotation = prevRotationRef.current;
        const targetScale = prevScaleRef.current;

        const globe = d3.select(globeRef.current);

        const zoomOutTransition = svg
          .transition("zoom")
          .duration(1000)
          .ease(d3.easeQuadInOut);

        zoomTransitionRef.current = zoomOutTransition;

        let interpolateRotation = d3.interpolate(projection.rotate(), targetRotation);
        let interpolateScale = d3.interpolateNumber(projection.scale(), targetScale);

        zoomOutTransition
          .tween("rotate", () => {
            return (t) => {
              projection.rotate(interpolateRotation(t));
              projection.scale(interpolateScale(t));
              globe.attr("r", projection.scale());
              calcCountryPaths();
              calcPointPaths();
              // REMOVED updateVisibleCountries() from here
            };
          })
          .on("end interrupt", () => {
            zoomTransitionRef.current = null;
            updateVisibleCountries(); // Update (debounced) visible countries on transition end/interrupt
            
            // Only restart rotation if:
            // 1. No manual interaction happened during the transition.
            // 2. The globe is back at (or very close to) the initial scale.
            const isAtInitialScale = Math.abs(projection.scale() - initialScale) < 0.1;
            if (!isManualInteractionRef.current && isAtInitialScale) {
              timerRef.current = false;
              setRotationTimer();
            }
          });
      }
    }
  }, [zoomTargetCountry, initialScale, width, height]); // Removed projection

  // Initial setup effect
  useEffect(() => {
    calcPointPaths();
    calcCountryPaths();
    drawGlobe();
    setRotationTimer();
    
    // Use the immediate calculation for the initial render
    const currentRotation = projection.rotate();
    const currentScale = projection.scale();
    const visibilityThreshold = 90 * (initialScale / currentScale);

    const initialVisible = (wereld as WorldGeoJSON).features
       .filter(country => {
          // Get country centroid
          const centroid = d3.geoCentroid(country as d3.GeoPermissibleObjects);
          
          // Convert centroid to screen coordinates
          const lambda = centroid[0] + currentRotation[0];
          const phi = centroid[1] + currentRotation[1];
          
          // Calculate angular distance from the center of the view
          const distance = Math.acos(
            Math.sin(phi * Math.PI / 180) * Math.sin(-currentRotation[1] * Math.PI / 180) +
            Math.cos(phi * Math.PI / 180) * Math.cos(-currentRotation[1] * Math.PI / 180) *
            Math.cos((lambda - (-currentRotation[0])) * Math.PI / 180)
          ) * 180 / Math.PI;
          
          return distance < visibilityThreshold;
       })
       .map(country => country.properties.name);
       
    setCalculatedVisibleCountries(initialVisible);
    setVisibleCountries(initialVisible); // Set the main state directly for initial load
    if (onVisibleCountriesChange) {
       onVisibleCountriesChange(initialVisible);
    }
  }, [width, height]); // Removed projection

  return (
<svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="afbeelding van de wereld"
    >
      <defs>
        <g id="hitte-blauw">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <g>
              <path
                d="M49.78,69.08l-1.42-1.46c-6.9-7.12-8.33-15.84-3.67-22.26,2.07-2.83,3.01-6.33,2.64-9.81l-.89-9.17,2.37,2.59c6.27,6.85,7.58,15.04,3.4,21.24l-.75,1.12c-1.81,2.68-2.65,5.9-2.37,9.12l.69,8.64Z"
                fill="#fff"
              />
              <path
                d="M66.27,68.06l-1.12-1.16c-5.46-5.63-6.59-12.53-2.9-17.62h0c1.63-2.24,2.38-5.01,2.09-7.77l-.7-7.25,1.88,2.05c4.96,5.42,6,11.9,2.69,16.81l-.6.88c-1.43,2.12-2.1,4.67-1.87,7.22l.54,6.83Z"
                fill="#fff"
              />
              <path
                d="M33.51,68.06l-1.12-1.16c-5.46-5.63-6.59-12.53-2.9-17.62,1.64-2.24,2.38-5.01,2.09-7.77l-.7-7.25,1.88,2.05c4.96,5.42,6,11.9,2.69,16.81l-.6.88c-1.43,2.12-2.1,4.67-1.87,7.22l.54,6.84Z"
                fill="#fff"
              />
            </g>
          </g>
        </g>
        <g id="hitte-geel">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <g>
              <path
                d="M49.78,69.08l-1.42-1.46c-6.9-7.12-8.33-15.84-3.67-22.26,2.07-2.83,3.01-6.33,2.64-9.81l-.89-9.17,2.37,2.59c6.27,6.85,7.58,15.04,3.4,21.24l-.75,1.12c-1.81,2.68-2.65,5.9-2.37,9.12l.69,8.64Z"
                fill="#fff"
              />
              <path
                d="M66.27,68.06l-1.12-1.16c-5.46-5.63-6.59-12.53-2.9-17.62h0c1.63-2.24,2.38-5.01,2.09-7.77l-.7-7.25,1.88,2.05c4.96,5.42,6,11.9,2.69,16.81l-.6.88c-1.43,2.12-2.1,4.67-1.87,7.22l.54,6.83Z"
                fill="#fff"
              />
              <path
                d="M33.51,68.06l-1.12-1.16c-5.46-5.63-6.59-12.53-2.9-17.62,1.64-2.24,2.38-5.01,2.09-7.77l-.7-7.25,1.88,2.05c4.96,5.42,6,11.9,2.69,16.81l-.6.88c-1.43,2.12-2.1,4.67-1.87,7.22l.54,6.84Z"
                fill="#fff"
              />
            </g>
          </g>
        </g>
        <g id="hitte-rood">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <g>
              <path
                d="M49.78,69.08l-1.42-1.46c-6.9-7.12-8.33-15.84-3.67-22.26,2.07-2.83,3.01-6.33,2.64-9.81l-.89-9.17,2.37,2.59c6.27,6.85,7.58,15.04,3.4,21.24l-.75,1.12c-1.81,2.68-2.65,5.9-2.37,9.12l.69,8.64Z"
                fill="#fff"
              />
              <path
                d="M66.27,68.06l-1.12-1.16c-5.46-5.63-6.59-12.53-2.9-17.62h0c1.63-2.24,2.38-5.01,2.09-7.77l-.7-7.25,1.88,2.05c4.96,5.42,6,11.9,2.69,16.81l-.6.88c-1.43,2.12-2.1,4.67-1.87,7.22l.54,6.83Z"
                fill="#fff"
              />
              <path
                d="M33.51,68.06l-1.12-1.16c-5.46-5.63-6.59-12.53-2.9-17.62,1.64-2.24,2.38-5.01,2.09-7.77l-.7-7.25,1.88,2.05c4.96,5.42,6,11.9,2.69,16.81l-.6.88c-1.43,2.12-2.1,4.67-1.87,7.22l.54,6.84Z"
                fill="#fff"
              />
            </g>
          </g>
        </g>
        <g id="brand-blauw">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M57.16,74.84c4.42-5.15,3.92-10.25,1.91-15.4-.09-.22-.41-.19-.45.05-.29,1.65-.76,3.16-2.47,4.37-.16.12-.39-.03-.36-.23.73-5.87.46-11.32-4.57-15.36-.16-.13-.4.01-.38.22.51,4.44-2.26,6.98-5.27,9.47-5.64,4.78-6.47,10.3-3.15,16.7.1.19-.08.41-.28.34-13.58-4.84-12.81-30.7-5.88-41.66.13-.2.44-.09.43.15-.38,10.1.94,16.57,3.96,18.59.17.12.4-.02.37-.23-1.83-11.34-2.8-23.75,10.41-31.87-.06.99-1.16,3.38-1.22,3.76-.88,5.08.61,9.44,4.31,12.92,2.32,2.21,4.8,4.2,7.12,6.35,7.56,7.01,9.16,17.22,3.92,25.11-1.93,2.98-4.53,5.13-8.39,6.73h0Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="brand-geel">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M57.16,74.84c4.42-5.15,3.92-10.25,1.91-15.4-.09-.22-.41-.19-.45.05-.29,1.65-.76,3.16-2.47,4.37-.16.12-.39-.03-.36-.23.73-5.87.46-11.32-4.57-15.36-.16-.13-.4.01-.38.22.51,4.44-2.26,6.98-5.27,9.47-5.64,4.78-6.47,10.3-3.15,16.7.1.19-.08.41-.28.34-13.58-4.84-12.81-30.7-5.88-41.66.13-.2.44-.09.43.15-.38,10.1.94,16.57,3.96,18.59.17.12.4-.02.37-.23-1.83-11.34-2.8-23.75,10.41-31.87-.06.99-1.16,3.38-1.22,3.76-.88,5.08.61,9.44,4.31,12.92,2.32,2.21,4.8,4.2,7.12,6.35,7.56,7.01,9.16,17.22,3.92,25.11-1.93,2.98-4.53,5.13-8.39,6.73h0Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="brand-rood">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M57.16,74.84c4.42-5.15,3.92-10.25,1.91-15.4-.09-.22-.41-.19-.45.05-.29,1.65-.76,3.16-2.47,4.37-.16.12-.39-.03-.36-.23.73-5.87.46-11.32-4.57-15.36-.16-.13-.4.01-.38.22.51,4.44-2.26,6.98-5.27,9.47-5.64,4.78-6.47,10.3-3.15,16.7.1.19-.08.41-.28.34-13.58-4.84-12.81-30.7-5.88-41.66.13-.2.44-.09.43.15-.38,10.1.94,16.57,3.96,18.59.17.12.4-.02.37-.23-1.83-11.34-2.8-23.75,10.41-31.87-.06.99-1.16,3.38-1.22,3.76-.88,5.08.61,9.44,4.31,12.92,2.32,2.21,4.8,4.2,7.12,6.35,7.56,7.01,9.16,17.22,3.92,25.11-1.93,2.98-4.53,5.13-8.39,6.73h0Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="droogte-blauw">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <g>
              <path
                d="M46.47,43.37l-9.9-2.71c-.33-.09-.69-.02-.96.19l-5.49,4.24c-.27.21-.43.53-.43.87v12.81c0,.66.58,1.17,1.23,1.09,1.19-.15,2.45-.31,3.76-.47.27-.03.53-.17.71-.38l11.62-13.87c.51-.61.22-1.55-.55-1.76Z"
                fill="#fff"
              />
              <path
                d="M29.7,62.79v1.33c0,.57.72.83,1.08.39l1.64-1.95c.36-.43,0-1.07-.55-1l-1.21.15c-.55.07-.96.53-.96,1.09Z"
                fill="#fff"
              />
              <path
                d="M29.7,39.65v2.26c0,.54.62.85,1.05.53l2.23-1.65c.44-.33.31-1.02-.22-1.17l-2.23-.61c-.42-.11-.83.2-.83.64Z"
                fill="#fff"
              />
              <path
                d="M62.3,29.81l-9.77,11.5c-.52.61-.23,1.55.55,1.77l16.4,4.49c.7.19,1.38-.33,1.38-1.06v-15.99c0-.6-.49-1.1-1.1-1.1h-6.63c-.32,0-.63.14-.83.39Z"
                fill="#fff"
              />
              <path
                d="M44.98,29.42h-14.19c-.6,0-1.1.49-1.1,1.1v5.32c0,.49.33.93.81,1.06l5.13,1.4c.32.09.67.02.94-.18l9.06-6.73c.85-.63.4-1.97-.65-1.97Z"
                fill="#fff"
              />
              <path
                d="M40.25,58.7c10.76-1.35,23.19-2.92,29.66-3.73.55-.07.95-.53.95-1.09v-3c0-.49-.33-.93-.81-1.06l-19.42-5.31c-.41-.11-.85.02-1.12.35l-10.22,12.04c-.65.76-.02,1.92.97,1.8Z"
                fill="#fff"
              />
              <path
                d="M50,41.57l8.67-10.35c.6-.71.09-1.8-.84-1.8h-7.04c-.24,0-.48.08-.67.23l-10.33,7.97c-.72.55-.49,1.68.38,1.92l8.69,2.38c.41.11.85-.02,1.13-.35Z"
                fill="#fff"
              />
              <path
                d="M35.46,61.41l-5.5,6.47c-.17.2-.26.45-.26.71v.9c0,.6.49,1.1,1.1,1.1h22.22c1,0,1.48-1.24.73-1.91l-9.23-8.29c-.24-.21-.55-.31-.87-.27l-7.5.92c-.27.03-.52.17-.7.38Z"
                fill="#fff"
              />
              <path
                d="M58.51,70.58h11.25c.6,0,1.1-.49,1.1-1.1v-11.49c0-.66-.58-1.17-1.23-1.09l-21.22,2.61c-.93.12-1.3,1.28-.59,1.9l9.97,8.88c.2.18.46.28.73.28Z"
                fill="#fff"
              />
            </g>
          </g>
        </g>
        <g id="droogte-geel">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <g>
              <path
                d="M46.47,43.37l-9.9-2.71c-.33-.09-.69-.02-.96.19l-5.49,4.24c-.27.21-.43.53-.43.87v12.81c0,.66.58,1.17,1.23,1.09,1.19-.15,2.45-.31,3.76-.47.27-.03.53-.17.71-.38l11.62-13.87c.51-.61.22-1.55-.55-1.76Z"
                fill="#fff"
              />
              <path
                d="M29.7,62.79v1.33c0,.57.72.83,1.08.39l1.64-1.95c.36-.43,0-1.07-.55-1l-1.21.15c-.55.07-.96.53-.96,1.09Z"
                fill="#fff"
              />
              <path
                d="M29.7,39.65v2.26c0,.54.62.85,1.05.53l2.23-1.65c.44-.33.31-1.02-.22-1.17l-2.23-.61c-.42-.11-.83.2-.83.64Z"
                fill="#fff"
              />
              <path
                d="M62.3,29.81l-9.77,11.5c-.52.61-.23,1.55.55,1.77l16.4,4.49c.7.19,1.38-.33,1.38-1.06v-15.99c0-.6-.49-1.1-1.1-1.1h-6.63c-.32,0-.63.14-.83.39Z"
                fill="#fff"
              />
              <path
                d="M44.98,29.42h-14.19c-.6,0-1.1.49-1.1,1.1v5.32c0,.49.33.93.81,1.06l5.13,1.4c.32.09.67.02.94-.18l9.06-6.73c.85-.63.4-1.97-.65-1.97Z"
                fill="#fff"
              />
              <path
                d="M40.25,58.7c10.76-1.35,23.19-2.92,29.66-3.73.55-.07.95-.53.95-1.09v-3c0-.49-.33-.93-.81-1.06l-19.42-5.31c-.41-.11-.85.02-1.12.35l-10.22,12.04c-.65.76-.02,1.92.97,1.8Z"
                fill="#fff"
              />
              <path
                d="M50,41.57l8.67-10.35c.6-.71.09-1.8-.84-1.8h-7.04c-.24,0-.48.08-.67.23l-10.33,7.97c-.72.55-.49,1.68.38,1.92l8.69,2.38c.41.11.85-.02,1.13-.35Z"
                fill="#fff"
              />
              <path
                d="M35.46,61.41l-5.5,6.47c-.17.2-.26.45-.26.71v.9c0,.6.49,1.1,1.1,1.1h22.22c1,0,1.48-1.24.73-1.91l-9.23-8.29c-.24-.21-.55-.31-.87-.27l-7.5.92c-.27.03-.52.17-.7.38Z"
                fill="#fff"
              />
              <path
                d="M58.51,70.58h11.25c.6,0,1.1-.49,1.1-1.1v-11.49c0-.66-.58-1.17-1.23-1.09l-21.22,2.61c-.93.12-1.3,1.28-.59,1.9l9.97,8.88c.2.18.46.28.73.28Z"
                fill="#fff"
              />
            </g>
          </g>
        </g>
        <g id="droogte-rood">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <g>
              <path
                d="M46.47,43.37l-9.9-2.71c-.33-.09-.69-.02-.96.19l-5.49,4.24c-.27.21-.43.53-.43.87v12.81c0,.66.58,1.17,1.23,1.09,1.19-.15,2.45-.31,3.76-.47.27-.03.53-.17.71-.38l11.62-13.87c.51-.61.22-1.55-.55-1.76Z"
                fill="#fff"
              />
              <path
                d="M29.7,62.79v1.33c0,.57.72.83,1.08.39l1.64-1.95c.36-.43,0-1.07-.55-1l-1.21.15c-.55.07-.96.53-.96,1.09Z"
                fill="#fff"
              />
              <path
                d="M29.7,39.65v2.26c0,.54.62.85,1.05.53l2.23-1.65c.44-.33.31-1.02-.22-1.17l-2.23-.61c-.42-.11-.83.2-.83.64Z"
                fill="#fff"
              />
              <path
                d="M62.3,29.81l-9.77,11.5c-.52.61-.23,1.55.55,1.77l16.4,4.49c.7.19,1.38-.33,1.38-1.06v-15.99c0-.6-.49-1.1-1.1-1.1h-6.63c-.32,0-.63.14-.83.39Z"
                fill="#fff"
              />
              <path
                d="M44.98,29.42h-14.19c-.6,0-1.1.49-1.1,1.1v5.32c0,.49.33.93.81,1.06l5.13,1.4c.32.09.67.02.94-.18l9.06-6.73c.85-.63.4-1.97-.65-1.97Z"
                fill="#fff"
              />
              <path
                d="M40.25,58.7c10.76-1.35,23.19-2.92,29.66-3.73.55-.07.95-.53.95-1.09v-3c0-.49-.33-.93-.81-1.06l-19.42-5.31c-.41-.11-.85.02-1.12.35l-10.22,12.04c-.65.76-.02,1.92.97,1.8Z"
                fill="#fff"
              />
              <path
                d="M50,41.57l8.67-10.35c.6-.71.09-1.8-.84-1.8h-7.04c-.24,0-.48.08-.67.23l-10.33,7.97c-.72.55-.49,1.68.38,1.92l8.69,2.38c.41.11.85-.02,1.13-.35Z"
                fill="#fff"
              />
              <path
                d="M35.46,61.41l-5.5,6.47c-.17.2-.26.45-.26.71v.9c0,.6.49,1.1,1.1,1.1h22.22c1,0,1.48-1.24.73-1.91l-9.23-8.29c-.24-.21-.55-.31-.87-.27l-7.5.92c-.27.03-.52.17-.7.38Z"
                fill="#fff"
              />
              <path
                d="M58.51,70.58h11.25c.6,0,1.1-.49,1.1-1.1v-11.49c0-.66-.58-1.17-1.23-1.09l-21.22,2.61c-.93.12-1.3,1.28-.59,1.9l9.97,8.88c.2.18.46.28.73.28Z"
                fill="#fff"
              />
            </g>
          </g>
        </g>
        <g id="koud-blauw">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M73.5,50c0-.9-.73-1.62-1.62-1.62h-10.66l8.16-8.16c.59-.62.58-1.64-.04-2.26-.62-.62-1.64-.63-2.28-.02l-10.44,10.44h-4.99v-5l10.5-10.5c.56-.64.54-1.62-.07-2.23-.62-.62-1.65-.63-2.28-.02l-8.15,8.15v-10.66c0-.9-.73-1.62-1.62-1.62s-1.62.73-1.62,1.62v10.66l-8.16-8.16c-.62-.6-1.64-.59-2.27.03-.62.62-.63,1.65-.02,2.28l10.45,10.44v5h-4.99l10.46,10.46c.62.6,1.64.59,2.26-.04s.63-1.65.02-2.28l-8.14-8.14h10.66c.9,0,1.62-.73,1.62-1.62Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="koud-geel">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M73.5,50c0-.9-.73-1.62-1.62-1.62h-10.66l8.16-8.16c.59-.62.58-1.64-.04-2.26-.62-.62-1.64-.63-2.28-.02l-10.44,10.44h-4.99v-5l10.5-10.5c.56-.64.54-1.62-.07-2.23-.62-.62-1.65-.63-2.28-.02l-8.15,8.15v-10.66c0-.9-.73-1.62-1.62-1.62s-1.62.73-1.62,1.62v10.66l-8.16-8.16c-.62-.6-1.64-.59-2.27.03-.62.62-.63,1.65-.02,2.28l10.45,10.44v5h-4.99l10.46,10.46c.62.6,1.64.59,2.26-.04s.63-1.65.02-2.28l-8.14-8.14h10.66c.9,0,1.62-.73,1.62-1.62Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="koud-rood">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M73.5,50c0-.9-.73-1.62-1.62-1.62h-10.66l8.16-8.16c.59-.62.58-1.64-.04-2.26-.62-.62-1.64-.63-2.28-.02l-10.44,10.44h-4.99v-5l10.5-10.5c.56-.64.54-1.62-.07-2.23-.62-.62-1.65-.63-2.28-.02l-8.15,8.15v-10.66c0-.9-.73-1.62-1.62-1.62s-1.62.73-1.62,1.62v10.66l-8.16-8.16c-.62-.6-1.64-.59-2.27.03-.62.62-.63,1.65-.02,2.28l10.45,10.44v5h-4.99l-10.46-10.46c-.32-.33-.74-.51-1.17-.51h-.01c-.43,0-.85.17-1.15.48-.3.3-.48.73-.47,1.16,0,.43.18.86.5,1.16l8.18,8.18h-10.66c-.9,0-1.62.73-1.62,1.62s.73,1.62,1.62,1.62h10.66l-8.16,8.16c-.33.32-.51.74-.51,1.18,0,.43.17.86.47,1.16.3.3.72.47,1.15.47h.01c.43,0,.85-.18,1.15-.5l10.48-10.48h4.99v5l-10.5,10.5c-.56.64-.54,1.62.07,2.23.63.63,1.65.63,2.29.02l8.15-8.15v10.66c0,.9.73,1.62,1.62,1.62s1.62-.73,1.62-1.62v-10.66l8.16,8.16c.62.6,1.65.6,2.27-.03s.63-1.65.01-2.29l-10.45-10.44v-5h4.99l10.46,10.46c.62.6,1.64.59,2.26-.04s.63-1.65.02-2.28l-8.14-8.14h10.66c.9,0,1.62-.73,1.62-1.62Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="regen-blauw">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M41.11,61.39c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15h0Z"
              fill="#fff"
            />
            <path
              d="M48.91,56.57c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M60.37,56.57c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M43.18,68.16c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M54.64,68.16c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M62.09,29.02h0c-1.55-5.12-6.31-8.84-11.93-8.84-4.87,0-9.09,2.79-11.15,6.86-.67-.21-1.36-.31-2.1-.31-4,0-7.23,3.23-7.23,7.24,0,.92.16,1.78.47,2.6-2.93,1.28-4.98,4.21-4.98,7.61,0,4.6,3.73,8.32,8.32,8.32h28.42c6.49,0,11.75-5.25,11.75-11.75s-5.15-11.63-11.56-11.73Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="regen-geel">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M41.11,61.39c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15h0Z"
              fill="#fff"
            />
            <path
              d="M48.91,56.57c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M60.37,56.57c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M43.18,68.16c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M54.64,68.16c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M62.09,29.02h0c-1.55-5.12-6.31-8.84-11.93-8.84-4.87,0-9.09,2.79-11.15,6.86-.67-.21-1.36-.31-2.1-.31-4,0-7.23,3.23-7.23,7.24,0,.92.16,1.78.47,2.6-2.93,1.28-4.98,4.21-4.98,7.61,0,4.6,3.73,8.32,8.32,8.32h28.42c6.49,0,11.75-5.25,11.75-11.75s-5.15-11.63-11.56-11.73Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="regen-rood">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M41.11,61.39c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15h0Z"
              fill="#fff"
            />
            <path
              d="M48.91,56.57c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M60.37,56.57c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M43.18,68.16c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M54.64,68.16c-.89,1.12-2.66,3.52-2.66,4.82,0,1.74,1.41,3.15,3.15,3.15s3.15-1.41,3.15-3.15c0-1.3-1.77-3.7-2.66-4.82-.25-.32-.74-.32-.99,0h0Z"
              fill="#fff"
            />
            <path
              d="M62.09,29.02h0c-1.55-5.12-6.31-8.84-11.93-8.84-4.87,0-9.09,2.79-11.15,6.86-.67-.21-1.36-.31-2.1-.31-4,0-7.23,3.23-7.23,7.24,0,.92.16,1.78.47,2.6-2.93,1.28-4.98,4.21-4.98,7.61,0,4.6,3.73,8.32,8.32,8.32h28.42c6.49,0,11.75-5.25,11.75-11.75s-5.15-11.63-11.56-11.73Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="storm-blauw">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#286eb4" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M47.15,59.89c1.61-.06,5.05-.04,6.73-.04.27,0,.46.27.36.53l-2.38,6.06c-.06.12-.05.26.02.37s.19.18.32.18h5.24c.15,0,.29.09.35.23.06.14.03.3-.07.41l-13.78,14.83c-.12.13-.31.16-.47.07-.15-.09-.23-.27-.18-.44l3.2-11.02c.03-.11.01-.24-.06-.34-.07-.1-.19-.15-.31-.15h-3.55c-.13,0-.25-.07-.32-.18s-.08-.25-.03-.37l3.15-6.96,1.42-2.95c.07-.14.2-.24.36-.24Z"
              fill="#fff"
              fillRule="evenodd"
            />
            <path
              d="M64.54,32.02h0c-1.55-5.12-6.31-8.84-11.93-8.84-4.87,0-9.09,2.79-11.15,6.86-.67-.21-1.36-.31-2.1-.31-4,0-7.23,3.23-7.23,7.24,0,.92.16,1.78.47,2.6-2.93,1.28-4.98,4.21-4.98,7.61,0,4.6,3.73,8.32,8.32,8.32h28.42c6.49,0,11.75-5.25,11.75-11.75s-5.15-11.63-11.56-11.73Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="storm-geel">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#ffc828" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M47.15,59.89c1.61-.06,5.05-.04,6.73-.04.27,0,.46.27.36.53l-2.38,6.06c-.06.12-.05.26.02.37s.19.18.32.18h5.24c.15,0,.29.09.35.23.06.14.03.3-.07.41l-13.78,14.83c-.12.13-.31.16-.47.07-.15-.09-.23-.27-.18-.44l3.2-11.02c.03-.11.01-.24-.06-.34-.07-.1-.19-.15-.31-.15h-3.55c-.13,0-.25-.07-.32-.18s-.08-.25-.03-.37l3.15-6.96,1.42-2.95c.07-.14.2-.24.36-.24Z"
              fill="#fff"
              fillRule="evenodd"
            />
            <path
              d="M64.54,32.02h0c-1.55-5.12-6.31-8.84-11.93-8.84-4.87,0-9.09,2.79-11.15,6.86-.67-.21-1.36-.31-2.1-.31-4,0-7.23,3.23-7.23,7.24,0,.92.16,1.78.47,2.6-2.93,1.28-4.98,4.21-4.98,7.61,0,4.6,3.73,8.32,8.32,8.32h28.42c6.49,0,11.75-5.25,11.75-11.75s-5.15-11.63-11.56-11.73Z"
              fill="#fff"
            />
          </g>
        </g>
        <g id="storm-rood">
          <g id="Layer_1" data-name="Layer 1">
            <circle cx="50" cy="50" r="50" fill="#e61e14" />
          </g>
          <g id="Layer_2" data-name="Layer 2">
            <path
              d="M47.15,59.89c1.61-.06,5.05-.04,6.73-.04.27,0,.46.27.36.53l-2.38,6.06c-.06.12-.05.26.02.37s.19.18.32.18h5.24c.15,0,.29.09.35.23.06.14.03.3-.07.41l-13.78,14.83c-.12.13-.31.16-.47.07-.15-.09-.23-.27-.18-.44l3.2-11.02c.03-.11.01-.24-.06-.34-.07-.1-.19-.15-.31-.15h-3.55c-.13,0-.25-.07-.32-.18s-.08-.25-.03-.37l3.15-6.96,1.42-2.95c.07-.14.2-.24.36-.24Z"
              fill="#fff"
              fillRule="evenodd"
            />
            <path
              d="M64.54,32.02h0c-1.55-5.12-6.31-8.84-11.93-8.84-4.87,0-9.09,2.79-11.15,6.86-.67-.21-1.36-.31-2.1-.31-4,0-7.23,3.23-7.23,7.24,0,.92.16,1.78.47,2.6-2.93,1.28-4.98,4.21-4.98,7.61,0,4.6,3.73,8.32,8.32,8.32h28.42c6.49,0,11.75-5.25,11.75-11.75s-5.15-11.63-11.56-11.73Z"
              fill="#fff"
            />
          </g>
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

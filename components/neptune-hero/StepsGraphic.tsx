"use client";

import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";
import type { StepId } from "./types";

interface StepsLayout {
  circleY: number[];
  segments: { from: number; to: number }[];
  svgHeight: number;
}

interface StepsGraphicProps {
  activeStepId: StepId;
  layout?: StepsLayout | null;
}

const CIRCLE_RADIUS = 16.5;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Original Y positions of circles (fallback)
const CIRCLE_Y = [17, 132, 247] as const;

// Original segments (fallback)
const SEGMENTS = [
  { from: 34, to: 116 }, // length 82, between 1st and 2nd
  { from: 149, to: 231 }, // length 82, between 2nd and 3rd
] as const;

const STATIC_SVG_HEIGHT = 308;

// Durations for each step (circle + line) in ms
const STEP_DURATION_MS: Record<StepId, number> = {
  describe: 9400,
  review: 24000,
  deploy: 18000,
};

const CIRCLE_FRACTION = 0.99;

function getDurationsForStep(stepId: StepId) {
  const total = STEP_DURATION_MS[stepId];
  const circleMs = total * CIRCLE_FRACTION;
  const lineMs = total - circleMs;
  return { circleMs, lineMs };
}

function stepIdToIndex(stepId: StepId): number {
  switch (stepId) {
    case "describe":
      return 0;
    case "review":
      return 1;
    case "deploy":
      return 2;
    default:
      return 0;
  }
}

export function StepsGraphic({ activeStepId, layout }: StepsGraphicProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const circlesRef = useRef<SVGCircleElement[]>([]);
  const segmentsRef = useRef<SVGPathElement[]>([]);
  const segmentLengthsRef = useRef<number[]>([]);
  const initializedRef = useRef(false);

  // Use layout from props if it exists, otherwise fallback to static values
  const circlePositions: number[] = layout?.circleY ?? [...CIRCLE_Y];
  const segmentsDef: { from: number; to: number }[] =
    layout?.segments ?? [...SEGMENTS];
  const svgHeight = layout?.svgHeight ?? STATIC_SVG_HEIGHT;

  // Baseline - if we have layout, follow circles; otherwise use old values
  const baselineFrom = layout
    ? circlePositions[0] + CIRCLE_RADIUS * 0.5
    : 25;
  const baselineTo = layout
    ? circlePositions[circlePositions.length - 1] - CIRCLE_RADIUS * 0.5
    : 264;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!svgRef.current) return;

    const ctx = gsap.context(() => {
      const circles: SVGCircleElement[] = [];
      const segments: SVGPathElement[] = [];

      circlePositions.forEach((_, idx) => {
        const c = svgRef.current!.querySelector<SVGCircleElement>(
          `[data-circle="${idx}"]`
        );
        if (c) circles.push(c);
      });

      segmentsDef.forEach((_, idx) => {
        const s = svgRef.current!.querySelector<SVGPathElement>(
          `[data-segment="${idx}"]`
        );
        if (s) segments.push(s);
      });

      circlesRef.current = circles;
      segmentsRef.current = segments;
      segmentLengthsRef.current = segmentsDef.map(
        (seg) => seg.to - seg.from
      );

      // Initially all empty
      circles.forEach((c) => {
        gsap.set(c, {
          strokeDasharray: CIRCUMFERENCE,
          strokeDashoffset: CIRCUMFERENCE,
        });
      });
      segments.forEach((s, i) => {
        const length = segmentLengthsRef.current[i] ?? 0;
        gsap.set(s, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      initializedRef.current = true;
    }, svgRef);

    return () => ctx.revert();
    // Reinitialize if layout changes (e.g. resize / text wrap)
  }, [circlePositions, segmentsDef, svgHeight]);

  useEffect(() => {
    if (!initializedRef.current) return;

    const circles = circlesRef.current;
    const segments = segmentsRef.current;
    const segLengths = segmentLengthsRef.current;

    if (!circles.length) return;

    const activeIndex = stepIdToIndex(activeStepId);
    const { circleMs, lineMs } = getDurationsForStep(activeStepId);

    // Remove all old tweens
    gsap.killTweensOf([...circles, ...segments]);

    // 1) CIRCLES - set state for all circles
    circles.forEach((c, idx) => {
      if (idx < activeIndex) {
        // Previous steps → circles filled
        gsap.set(c, {
          strokeDasharray: CIRCUMFERENCE,
          strokeDashoffset: 0,
        });
      } else if (idx > activeIndex) {
        // Future steps → empty
        gsap.set(c, {
          strokeDasharray: CIRCUMFERENCE,
          strokeDashoffset: CIRCUMFERENCE,
        });
      }
      // Current circle handled by animation below
    });

    // 2) SEGMENTS - set state for all lines
    segments.forEach((s, idx) => {
      const len = segLengths[idx] ?? 0;

      if (idx < activeIndex) {
        // Previous segments → filled
        gsap.set(s, {
          strokeDasharray: len,
          strokeDashoffset: 0,
        });
      } else if (idx > activeIndex) {
        // Future segments → empty
        gsap.set(s, {
          strokeDasharray: len,
          strokeDashoffset: len,
        });
      }
      // Current segment (idx === activeIndex) handled below
    });

    // 3) Animate ONLY current step
    const circle = circles[activeIndex];
    const seg = segments[activeIndex];
    const segLen = segLengths[activeIndex];

    // Current circle always starts from empty to full
    if (circle) {
      gsap.set(circle, {
        strokeDasharray: CIRCUMFERENCE,
        strokeDashoffset: CIRCUMFERENCE,
      });

      gsap.to(circle, {
        strokeDashoffset: 0,
        duration: circleMs / 1000,
        ease: "power2.out",
      });
    }

    // Current segment (line) - only for steps 0 and 1, but code is generic
    if (seg && typeof segLen === "number") {
      // Current segment always starts from empty
      gsap.set(seg, {
        strokeDasharray: segLen,
        strokeDashoffset: segLen,
      });

      gsap.to(seg, {
        strokeDashoffset: 0,
        duration: lineMs / 1000,
        ease: "power2.out",
        delay: circleMs / 1000,
      });
    }
  }, [activeStepId]);

  return (
    <svg
      ref={svgRef}
      width="34"
      height={svgHeight}
      viewBox={`0 0 34 ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1607_4529)">
        {/* dotted baseline */}
        <path
          d={`M17 ${baselineFrom}L17 ${baselineTo}`}
          stroke="#273443"
          strokeDasharray="4 4"
        />

        {/* SEGMENTI */}
        {segmentsDef.map((seg, index) => (
          <path
            key={index}
            data-segment={index}
            d={`M17 ${seg.from}L17 ${seg.to}`}
            stroke="url(#lineGradient)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}

        {/* KRUGOVI + BROJEVI */}
        {circlePositions.map((cy, index) => (
          <g key={index}>
            {/* neutralni krug */}
            <circle
              cx={17}
              cy={cy}
              r={16.5}
              fill="#060A0F"
              stroke="#273443"
            />
            {/* animirani gradient stroke */}
            <circle
              data-circle={index}
              cx={17}
              cy={cy}
              r={16.5}
              stroke="url(#circleGradient)"
              strokeWidth={1.5}
              fill="none"
              transform={`rotate(-90 17 ${cy})`}
            />
            {/* Step number (static, no animation) */}
            <text
              x={17}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="#B1BDC8"
            >
              {index + 1}
            </text>
          </g>
        ))}
      </g>
      <defs>
        <linearGradient
          id="lineGradient"
          x1="3.5"
          y1="8"
          x2="32"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2BECAC" />
          <stop offset="1" stopColor="#2B65EC" />
        </linearGradient>

        <linearGradient id="circleGradient" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2BECAC" />
          <stop offset="1" stopColor="#2B65EC" />
        </linearGradient>

        <clipPath id="clip0_1607_4529">
          <rect width="34" height={svgHeight} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
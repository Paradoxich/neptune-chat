"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { StepsGraphic } from "./StepsGraphic";
import { STEPS, useNeptuneHeroMachine } from "./animation";
import { ChatElements } from "./ChatElements";

const CIRCLE_RADIUS = 16.5;

type StepsLayout = {
  circleY: number[];
  segments: { from: number; to: number }[];
  svgHeight: number;
};

export default function NeptuneHero() {
  const { state, step, goToStep, isPlaying, play, pause } =
    useNeptuneHeroMachine({
      autoplay: true,
      loop: true,
      autoplayDelayMs: 0,
    });

  const stepsTextRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [stepsLayout, setStepsLayout] = useState<StepsLayout | null>(null);

  // Measure steps text layout → centers + segments
  useLayoutEffect(() => {
    const measure = () => {
      const container = stepsTextRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      const circleY: number[] = [];
      for (let i = 0; i < STEPS.length; i++) {
        const el = stepRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const centerY = r.top - containerRect.top + r.height / 2;
        circleY.push(centerY);
      }

      if (circleY.length === 0) return;

      const svgHeight = containerRect.height;

      const segments: { from: number; to: number }[] = [];
      for (let i = 0; i < circleY.length - 1; i++) {
        const from = circleY[i] + CIRCLE_RADIUS;
        const to = circleY[i + 1] - CIRCLE_RADIUS;
        segments.push({ from, to });
      }

      setStepsLayout({
        circleY,
        segments,
        svgHeight,
      });
    };

    // Initial measure
    measure();

    const container = stepsTextRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (container && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(container);
    } else if (typeof window !== "undefined") {
      window.addEventListener("resize", measure);
    }

    return () => {
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
      } else if (typeof window !== "undefined") {
        window.removeEventListener("resize", measure);
      }
    };
  }, []);

  return (
    <section className="neptune-hero">
      <div className="neptune-hero__container">
        <div className="neptune-hero__layout">
          {/* TITLE */}
          <div className="neptune-hero__title">
            <h2
              style={{
                color: "#F0F0F0",
                fontFamily:
                  '"Switzer Variable", system-ui, -apple-system, sans-serif',
                fontSize: 40,
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "120%",
                margin: 0,
              }}
            >
              The easiest path
              <br />
              from code to cloud.
            </h2>
          </div>

          {/* CHAT ANIMATION (always sits in the middle on mobile) */}
          <div className="neptune-hero__chat-wrapper">
            <div
              className="neptune-hero__chat"
              style={{
                position: "relative",
                height: 600,
                borderRadius: 24,
                border: "1px solid #273443",
                overflow: "hidden",
                backgroundImage: "url('/neptune-hero-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <ChatElements state={state} />

              {/* PAUSE BUTTON - Hidden for production, but kept for easier animation debugging
                  To show: remove `display: "none"` from the style prop below */}
              <button
                type="button"
                onClick={isPlaying ? pause : play}
                style={{
                  position: "absolute",
                  top: 28,
                  right: 28,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid #273443",
                  background: "#060A0F",
                  fontSize: 11,
                  fontFamily:
                    '"Switzer Variable", system-ui, -apple-system, sans-serif',
                  color: "#B1BDC8",
                  cursor: "pointer",
                  opacity: 0.75,
                  display: "none", // Change this to "block" to show pause button
                }}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
          </div>

          {/* STEPS – on desktop this sits under the title in the left column */}
          <div className="neptune-hero__steps">
            <div className="neptune-hero__steps-inner">
              <div className="neptune-hero__steps-graphic">
                <StepsGraphic activeStepId={step.id} layout={stepsLayout} />
              </div>

              <div
                className="neptune-hero__steps-text"
                ref={stepsTextRef}
              >
                {STEPS.map((s, index) => {
                  const isActive = s.id === step.id;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      ref={(el) => {
                        stepRefs.current[index] = el;
                      }}
                      onClick={() => goToStep(s.id)}
                      style={{
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          color: isActive ? "#F0F0F0" : "#D1D5DB",
                          fontFamily:
                            '"Switzer Variable", system-ui, -apple-system, sans-serif',
                          fontSize: 18,
                          fontWeight: 500,
                          lineHeight: "normal",
                          marginBottom: 4,
                        }}
                      >
                        {s.label}
                      </div>
                      <p
                        style={{
                          color: isActive ? "#B1BDC8" : "#6B7280",
                          fontFamily:
                            '"Switzer Variable", system-ui, -apple-system, sans-serif',
                          fontSize: 16,
                          fontWeight: 400,
                          lineHeight: "150%",
                          margin: 0,
                        }}
                      >
                        {s.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .neptune-hero {
          width: 100%;
          padding: 80px 0;
        }

        .neptune-hero__container {
          max-width: 1512px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Mobile / small screens: stacked layout
           Order in DOM: Title -> Chat -> Steps */
        .neptune-hero__layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .neptune-hero__title {
          max-width: 412px;
        }

        .neptune-hero__chat-wrapper {
          width: 100%;
        }

        .neptune-hero__steps-inner {
          display: grid;
          grid-template-columns: 34px 1fr;
          column-gap: 24px;
          align-items: flex-start;
        }

        .neptune-hero__steps-graphic {
          width: 34px;
        }

        .neptune-hero__steps-text {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        @media (max-width: 480px) {
          .neptune-hero__chat {
            height: 400px !important;
          }
         .neptune-hero__steps-text {
      gap: 28px;
    }
        }

        @media (min-width: 1024px) {
  .neptune-hero__container {
    padding-left: 116px;
    padding-right: 116px;
  }

  .neptune-hero__layout {
    display: grid;
    grid-template-columns: 412px minmax(0, 1fr);
    grid-template-rows: auto auto;
    column-gap: 56px;
    row-gap: 56px;
  }

  .neptune-hero__title {
    grid-column: 1;
    align-self: end;
  }

  .neptune-hero__chat-wrapper {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
  }

  .neptune-hero__steps {
    grid-column: 1;
  }

  .neptune-hero__chat {
    height: 600px !important;
  }
}
      `}</style>
    </section>
  );
}
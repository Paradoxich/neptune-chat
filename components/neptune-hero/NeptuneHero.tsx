"use client";

import { useNeptuneHeroMachine } from "./animation";
import { ChatElements } from "./ChatElements";

export default function NeptuneHero() {
  const { state, isPlaying, play, pause } = useNeptuneHeroMachine({
    autoplay: true,
    loop: true,
    autoplayDelayMs: 0,
  });

  return (
    <section className="neptune-hero">
      <div className="neptune-hero__container">
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

            {/* PAUSE BUTTON – ostavljen zbog debugiranja, skriven u produkciji */}
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
                display: "block", // stavi "block" ako želiš vidjeti gumb
              }}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
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

        .neptune-hero__chat-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .neptune-hero__chat {
          width: 100%;
          max-width: 960px;
        }

        @media (max-width: 480px) {
          .neptune-hero__chat {
            height: 400px !important;
          }
        }

        @media (min-width: 1024px) {
          .neptune-hero__container {
            padding-left: 116px;
            padding-right: 116px;
          }

          .neptune-hero__chat {
            height: 600px !important;
          }
        }
      `}</style>
    </section>
  );
}

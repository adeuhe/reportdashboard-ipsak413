"use client";

import React from "react";

function getColorWithOpacity(colorStr: string, opacity: number): string {
  if (!colorStr) return `rgba(15, 23, 42, ${opacity})`;

  if (colorStr.startsWith('#')) {
    let hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  if (colorStr.startsWith('rgb')) {
    const matches = colorStr.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${opacity})`;
    }
  }

  return colorStr;
}

export default function WaveBackground({ color }: { color: string }) {
  const themeColor = color || "#0f172a";
  const colorOpacity12 = getColorWithOpacity(themeColor, 0.12);
  const colorOpacity08 = getColorWithOpacity(themeColor, 0.08);
  const colorOpacity10 = getColorWithOpacity(themeColor, 0.10);
  const colorOpacity06 = getColorWithOpacity(themeColor, 0.06);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes softAmbientShimmer {
          0% { transform: scale(1) translate(0%, 0%) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.15) translate(-4%, -3%) rotate(3deg); opacity: 0.8; }
          100% { transform: scale(1) translate(0%, 0%) rotate(0deg); opacity: 0.5; }
        }

        @keyframes fullScreenChromeSweep1 {
          0% { transform: translateX(-150%) translateY(-60%) rotate(22deg); }
          100% { transform: translateX(150%) translateY(60%) rotate(22deg); }
        }

        @keyframes fullScreenChromeSweep2 {
          0% { transform: translateX(150%) translateY(60%) rotate(-22deg); }
          100% { transform: translateX(-150%) translateY(-60%) rotate(-22deg); }
        }

        .ambient-soft-mesh-1 {
          animation: softAmbientShimmer 6s ease-in-out infinite alternate;
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at 20% 20%, ${colorOpacity12} 0%, transparent 50%),
                      radial-gradient(circle at 80% 30%, ${colorOpacity08} 0%, transparent 55%),
                      radial-gradient(circle at 50% 85%, ${colorOpacity10} 0%, transparent 60%);
          filter: blur(60px);
        }

        .ambient-soft-mesh-2 {
          animation: softAmbientShimmer 8s ease-in-out infinite alternate-reverse;
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at 75% 25%, ${colorOpacity06} 0%, transparent 50%),
                      radial-gradient(circle at 25% 75%, ${colorOpacity08} 0%, transparent 55%);
          filter: blur(70px);
        }

        .chrome-sweep-beam-1 {
          position: absolute;
          top: -75%;
          left: -75%;
          width: 250vw;
          height: 250vh;
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(255, 255, 255, 0.4) 44%,
            rgba(255, 255, 255, 1) 49%,
            rgba(255, 255, 255, 1) 51%,
            rgba(255, 255, 255, 0.4) 56%,
            transparent 70%
          );
          animation: fullScreenChromeSweep1 3.2s linear infinite;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .chrome-sweep-beam-2 {
          position: absolute;
          top: -75%;
          left: -75%;
          width: 250vw;
          height: 250vh;
          background: linear-gradient(
            65deg,
            transparent 32%,
            rgba(255, 255, 255, 0.3) 45%,
            rgba(255, 255, 255, 0.95) 50%,
            rgba(255, 255, 255, 0.3) 55%,
            transparent 68%
          );
          animation: fullScreenChromeSweep2 4.8s linear infinite;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
      `}} />

      {/* Soft Ambient Mesh Layers */}
      <div className="ambient-soft-mesh-1" />
      <div className="ambient-soft-mesh-2" />

      {/* Full-Screen Specular Chrome Light Sweep Beams */}
      <div className="chrome-sweep-beam-1" />
      <div className="chrome-sweep-beam-2" />
    </div>
  );
}

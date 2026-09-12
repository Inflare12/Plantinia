'use client';

import React, { useState } from 'react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface BoundingBoxOverlayProps {
  imageUrl: string;
  boxes?: BoundingBox[];
  className?: string;
}

export function BoundingBoxOverlay({ imageUrl, boxes = [], className = '' }: BoundingBoxOverlayProps) {
  const [activeBox, setActiveBox] = useState<number | null>(null);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black select-none ${className}`}>
      <img
        src={imageUrl}
        alt="Analyzed plant foliage"
        className="w-full h-auto max-h-[480px] object-cover rounded-2xl block"
      />

      {/* SVG Overlay */}
      {boxes && boxes.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {boxes.map((box, idx) => {
            const isHovered = activeBox === idx;
            return (
              <g key={idx} className="pointer-events-auto cursor-pointer" onMouseEnter={() => setActiveBox(idx)} onMouseLeave={() => setActiveBox(null)}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill={isHovered ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)'}
                  stroke={isHovered ? '#ef4444' : '#f87171'}
                  strokeWidth="0.8"
                  strokeDasharray="2,1"
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Labels floating on boxes */}
      {boxes &&
        boxes.map((box, idx) => (
          <div
            key={idx}
            style={{
              top: `${Math.max(2, box.y - 6)}%`,
              left: `${box.x}%`,
            }}
            className="absolute z-10 pointer-events-none transform -translate-y-1"
          >
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600/90 text-white shadow-md backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              {box.label}
            </span>
          </div>
        ))}
    </div>
  );
}

// TypingDots.tsx
import React from "react";

interface TypingDotsProps {
  className?: string; // custom class for dot
  sizeClass?: string; // custom size class for dot
}

export const TypingDots: React.FC<TypingDotsProps> = ({
  className = "bg-gray-800",
  sizeClass = "w-1 h-1",
}) => (
  <div className="typing-dots">
    <span className={`dot ${className} ${sizeClass}`}></span>
    <span className={`dot ${className} ${sizeClass}`}></span>
    <span className={`dot ${className} ${sizeClass}`}></span>
    <style jsx>{`
      @keyframes wave {
        0% {
          transform: translateY(0);
        }
        8% {
          transform: translateY(-4px);
        }
        16% {
          transform: translateY(-8px);
        }
        25% {
          transform: translateY(-4px);
        }
        33% {
          transform: translateY(0);
        }
        41% {
          transform: translateY(4px);
        }
        50% {
          transform: translateY(0);
        }
        58% {
          transform: translateY(-2px);
        }
        66% {
          transform: translateY(0);
        }
        100% {
          transform: translateY(0);
        }
      }
      .typing-dots {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .dot {
        border-radius: 50%;
        animation: wave 1.2s infinite;
        display: inline-block;
      }
      .dot:nth-child(1) {
        animation-delay: 0s;
      }
      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
    `}</style>
  </div>
);

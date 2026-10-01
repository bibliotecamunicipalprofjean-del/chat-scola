import React, { useEffect, useState } from "react";

interface ReadingGuideProps {
  isActive: boolean;
}

export const ReadingGuide: React.FC<ReadingGuideProps> = ({ isActive }) => {
  const [mouseY, setMouseY] = useState<number>(-100);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isActive]);

  if (!isActive || mouseY < 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 z-40 transition-transform duration-75"
      style={{
        top: `${mouseY - 18}px`,
        height: "36px",
        backgroundColor: "rgba(251, 191, 36, 0.18)",
        borderTop: "2px solid rgba(217, 119, 6, 0.7)",
        borderBottom: "2px solid rgba(217, 119, 6, 0.7)",
        boxShadow: "0 0 15px rgba(245, 158, 11, 0.25)"
      }}
    />
  );
};

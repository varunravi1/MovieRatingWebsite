import React, { useRef, useState, useCallback, useEffect } from "react";

interface SwipeEventData {
  deltaX: number;
  deltaY: number;
  velocityX: number;
}

interface MobileSwiperProps {
  children: React.ReactNode;
  onSwipe: (data: SwipeEventData) => void;
}

const MobileSwiper: React.FC<MobileSwiperProps> = ({ children, onSwipe }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (!wrapperRef.current?.contains(e.target as Node)) {
      return;
    }
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setCurrentX(e.touches[0].clientX);
    setStartTime(Date.now());
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!wrapperRef.current?.contains(e.target as Node)) {
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const endTime = Date.now();
    const deltaTime = endTime - startTime;

    const velocityX = deltaX / deltaTime;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      onSwipe({ deltaX, deltaY, velocityX });
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!wrapperRef.current?.contains(e.target as Node)) {
      return;
    }
    const moveX = e.touches[0].clientX - currentX;
    const moveY = e.touches[0].clientY - startY;
    const endTime = Date.now();
    const deltaTime = endTime - startTime;
    const velocityX = moveX / deltaTime;
    setCurrentX(e.touches[0].clientX);
    if (Math.abs(moveX) > Math.abs(moveY)) {
      onSwipe({
        deltaX: moveX,
        deltaY: moveY,
        velocityX: velocityX * 1.2,
      });
    }
  };
  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchStart, handleTouchEnd, startX, startY]);

  return <div ref={wrapperRef}>{children}</div>;
};

export default MobileSwiper;

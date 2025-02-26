import React, { useState, useEffect } from "react";
import Slidingimage1 from "../Images/Slidingimage-1.png";
import Slidingimage2 from "../Images/slidingimage-2.png";
import Slidingimage3 from "../Images/slidingimage-3.png";

const images = [
  Slidingimage1,
  Slidingimage2,
  Slidingimage3
];

const SlideImage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 overflow-hidden">
      <img
        src={images[currentIndex]}
        alt="Slide"
        className="w-full h-full object-cover transition-opacity duration-500"
      />
    </div>
  );
};

export default SlideImage;
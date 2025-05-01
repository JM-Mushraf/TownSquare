import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      handleNext()
    }
    if (touchEnd - touchStart > 100) {
      handlePrev()
    }
  }

  return (
    <div className="image-carousel">
      <div
        className="carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`carousel-track ${isTransitioning ? "transitioning" : ""}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="carousel-slide">
              <img src={image || "/placeholder.svg"} alt={`Image ${index + 1}`} className="carousel-image" />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button onClick={handlePrev} className="carousel-button carousel-button-prev" aria-label="Previous image">
              <ChevronLeft className="carousel-icon" />
            </button>
            <button onClick={handleNext} className="carousel-button carousel-button-next" aria-label="Next image">
              <ChevronRight className="carousel-icon" />
            </button>
            <div className="carousel-indicators">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-indicator ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImageCarousel
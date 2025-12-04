// src/components/PostCard.js
import React, { useState } from 'react';
import './PostCard.scss';

const PostCard = ({ post = {} }) => {
  const images = post.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = images.length > 0;
  const mode = (post.image_mode || 'none').toLowerCase();

  const goNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goTo = (idx) => {
    if (!hasImages) return;
    setCurrentIndex(idx);
  };

  return (
    <div className={`post-card post-card--${mode}`}>
      <h4 className="post-card__title">{post.title}</h4>
      <p className="post-card__content">{post.content}</p>

      {/* carousel */}
      {hasImages && (
        <>
          <div className="post-card__carousel">
            {images.length > 1 && (
              <button
                type="button"
                className="carousel-btn carousel-btn--prev"
                onClick={goPrev}
              >
                ‹
              </button>
            )}

            <div className="carousel-window">
              {images.map((img, idx) => (
                <img
                  key={img.image_id || idx}
                  src={img.image_url}
                  alt="post"
                  className={
                    idx === currentIndex
                      ? 'carousel-image is-active'
                      : 'carousel-image'
                  }
                />
              ))}
            </div>

            {images.length > 1 && (
              <button
                type="button"
                className="carousel-btn carousel-btn--next"
                onClick={goNext}
              >
                ›
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="carousel-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={
                    idx === currentIndex
                      ? 'carousel-dot is-active'
                      : 'carousel-dot'
                  }
                  onClick={() => goTo(idx)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostCard;

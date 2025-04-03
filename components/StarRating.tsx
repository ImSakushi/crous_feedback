import React, { useState } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, onRatingChange, disabled = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.starContainer}>
        <div className={styles.starRow}>
          {Array.from({ length: maxRating }).map((_, index) => {
            const starIndex = index + 1;
            const isActive = starIndex <= (hoveredRating || rating);
            return (
              <span
                key={index}
                className={
                  disabled
                    ? styles.disabledStar
                    : isActive
                    ? styles.activeStar
                    : styles.inactiveStar
                }
                onClick={() => { if (!disabled) onRatingChange(starIndex); }}
                onMouseEnter={() => { if (!disabled) setHoveredRating(starIndex); }}
                onMouseLeave={() => { if (!disabled) setHoveredRating(0); }}
                title={`${starIndex} ${starIndex > 1 ? 'étoiles' : 'étoile'}`}
                style={{ cursor: disabled ? 'default' : 'pointer', fontSize: '24px', margin: '4px' }}
              >
                ★
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StarRating;

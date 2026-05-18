import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showValue?: boolean;
}

export function StarRating({ rating, maxRating = 5, showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxRating }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < Math.round(rating)
                ? 'fill-accent text-accent'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

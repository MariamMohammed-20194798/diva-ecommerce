'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createProductReview } from '@/lib/products';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!body.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProductReview(productId, rating, body);
      toast.success('Review submitted successfully!');
      setRating(5);
      setBody('');
      onClose();
      onReviewSubmitted?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(5);
      setBody('');
      onClose();
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with {productName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= displayRating
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayRating > 0
                ? `${displayRating} star${displayRating !== 1 ? 's' : ''}`
                : 'Select a rating'}
            </p>
          </div>

          {/* Review Body */}
          <div className="space-y-3">
            <label htmlFor="review-body" className="text-sm font-medium text-foreground">
              Your Review
            </label>
            <textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your honest thoughts about this product..."
              className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">{body.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';
import { useTurfReviews, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ReviewSystemProps {
  turfId: string;
  bookingId?: string;
  canReview?: boolean;
}

const ReviewSystem = ({ turfId, bookingId, canReview = false }: ReviewSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: reviews = [], isLoading } = useTurfReviews(turfId);
  const createReview = useCreateReview();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = async () => {
    if (!user || !bookingId) {
      toast({
        title: "Error",
        description: "Unable to submit review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview.mutateAsync({
        booking_id: bookingId,
        turf_id: turfId,
        user_id: user.id,
        rating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      setShowReviewForm(false);
      setRating(0);
      setComment('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const StarRating = ({ value, onChange, readonly = false }: { 
    value: number; 
    onChange?: (rating: number) => void; 
    readonly?: boolean; 
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            disabled={readonly}
          >
            <Star
              className={`w-5 h-5 ${
                star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reviews & Ratings</span>
            {canReview && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                Write Review
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <StarRating value={Math.round(averageRating)} readonly />
              <div className="text-sm text-muted-foreground mt-1">
                {reviews.length} reviews
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span>{star}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating *
                </label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comment (Optional)
                </label>
                <Textarea
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitReview}
                  disabled={createReview.isPending || rating === 0}
                >
                  {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      Anonymous User
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'PPP')}
                    </div>
                  </div>
                </div>
                <StarRating value={review.rating} readonly />
              </div>
              
              {review.comment && (
                <p className="text-sm text-gray-700">{review.comment}</p>
              )}
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Reviews Yet</h4>
              <p className="text-muted-foreground">
                Be the first to review this turf!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;

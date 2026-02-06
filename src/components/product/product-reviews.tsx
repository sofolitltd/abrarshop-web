'use client';

import { useState } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { submitReview } from '@/lib/actions';
import { Review } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductReviewsProps {
    productId: string;
    initialReviews: Review[];
}

export function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: 'Authentication Required',
                description: 'Please login to write a review.',
                variant: 'destructive',
            });
            return;
        }
        if (rating === 0) {
            toast({
                title: 'Rating Required',
                description: 'Please select a star rating.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await submitReview({
                productId,
                userId: user.uid,
                userName: user.displayName || 'Customer', // Fallback name
                rating,
                comment,
            });

            if (response.success) {
                toast({
                    title: 'Review Submitted',
                    description: 'Thank you for your feedback!',
                });
                setComment('');
                setRating(0);
                router.refresh(); // Refresh to show new review if server fetched
                // Optimistically add review
                const newReview: Review = {
                    id: 'temp-' + Date.now(),
                    productId,
                    userId: user.uid,
                    userName: user.displayName || 'Customer',
                    rating,
                    comment,
                    status: 'approved',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setReviews([newReview, ...reviews]);
            } else {
                toast({
                    title: 'Error',
                    description: response.message || 'Failed to submit review.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0';

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold font-headline">Customer Reviews</h2>
                <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-full">
                    <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                    <span className="font-bold text-lg">{averageRating}</span>
                    <span className="text-zinc-500 text-sm">({reviews.length} reviews)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Reviews List */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-50 rounded-lg">
                            <p className="text-zinc-500">No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b border-zinc-100 pb-6 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{review.userName}</p>
                                            <p className="text-xs text-zinc-400">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "w-4 h-4",
                                                    star <= review.rating ? "fill-orange-500 text-orange-500" : "text-zinc-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Write Review Form */}
                <div className="bg-zinc-50 p-6 rounded-lg h-fit sticky top-24">
                    <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                    {!user ? (
                        <div className="text-center py-6">
                            <p className="text-zinc-500 text-sm mb-4">Please login to share your experience.</p>
                            <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                                Login to Review
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-8 h-8",
                                                    star <= (hoverRating || rating) ? "fill-orange-500 text-orange-500" : "text-zinc-300"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Review</label>
                                <Textarea
                                    placeholder="Share your thoughts about this product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="bg-white"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

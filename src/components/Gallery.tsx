import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchImages } from '../services/unsplash';
import type { UnsplashImage } from '../services/unsplash';
import { ImageCard } from './ImageCard';
import { useInView } from 'react-intersection-observer'; // Need to install this
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const Gallery = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['images'],
        queryFn: ({ pageParam = 1 }) => fetchImages(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
    });

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    if (status === 'pending') {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center p-20 text-red-400">
                Failed to load images. Please check your API key.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.pages.map((page) =>
                    page.map((image: UnsplashImage) => (
                        <ImageCard key={image.id} image={image} />
                    ))
                )}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="flex justify-center p-4">
                {isFetchingNextPage && (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                )}
            </div>
        </div>
    );
};

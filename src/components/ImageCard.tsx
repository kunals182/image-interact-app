import type { UnsplashImage } from '../services/unsplash';
import { db, isConfigured, type Interaction } from '../config/instant';
import { useUserStore } from '../store/useUserStore';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageCardProps {
    image: UnsplashImage;
}

export const ImageCard = ({ image }: ImageCardProps) => {
    const { username, setSelectedImage } = useUserStore();

    // Fetch reactions for this image
    const { data } = isConfigured && db ? db.useQuery({
        interactions: {
            $: {
                where: { imageId: image.id },
            },
        }
    }) : { data: null };

    const interactions = (data?.interactions || []) as Interaction[];
    const likes = interactions.filter((i) => i.type === 'like').length;
    const comments = interactions.filter((i) => i.type === 'comment').length;

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isConfigured || !db) return;

        db.transact(
            db.tx.interactions[crypto.randomUUID()].update({
                type: 'like',
                imageId: image.id,
                username,
                timestamp: Date.now(),
            })
        );
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer"
            onClick={() => setSelectedImage(image)}
        >
            <div className="aspect-[4/5] overflow-hidden">
                <img
                    src={image.urls.small}
                    alt={image.alt_description}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                            title="Like"
                        >
                            <Heart size={18} fill={interactions.some((i) => i.type === 'like' && i.username === username) ? "currentColor" : "none"} />
                            <span className="text-sm font-medium">{likes}</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle size={18} />
                            <span className="text-sm font-medium">{comments}</span>
                        </div>
                    </div>
                    <span className="text-xs text-white/70 italic truncate">by {image.user.username}</span>
                </div>
            </div>
        </motion.div>
    );
};

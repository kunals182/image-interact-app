import { db, isConfigured, type Interaction } from '../config/instant';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Smile, Info, Loader2 } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { fetchImageById } from '../services/unsplash';
import { useState } from 'react';

export const ActivityFeed = () => {
    const { setSelectedImage } = useUserStore();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Query ALL interactions for the global feed
    const { data, isLoading } = isConfigured && db ? db.useQuery({
        interactions: {
            $: {
                limit: 20,
            },
        }
    }) : { data: null, isLoading: false };

    const interactions = data?.interactions || [];

    const handleItemClick = async (imageId: string) => {
        try {
            setLoadingId(imageId);
            const image = await fetchImageById(imageId);
            setSelectedImage(image);
        } catch (error) {
            console.error('Failed to fetch image:', error);
        } finally {
            setLoadingId(null);
        }
    };

    if (!isConfigured) {
        return (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 text-sm flex gap-3">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>Real-time feed is disabled. Configure InstantDB to see global activity.</p>
            </div>
        );
    }

    // Sort by timestamp manually for now
    const sortedInteractions = [...interactions].sort((a: Interaction, b: Interaction) => b.timestamp - a.timestamp);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-slate-900 rounded-lg border border-slate-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {sortedInteractions.length === 0 ? (
                    <p className="text-center text-slate-500 py-10 italic">No activity yet...</p>
                ) : (
                    sortedInteractions.map((item: Interaction) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => handleItemClick(item.imageId)}
                            className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex gap-3 items-start hover:bg-slate-900 transition-all cursor-pointer group"
                        >
                            <div className="mt-1 relative">
                                {loadingId === item.imageId ? (
                                    <Loader2 size={14} className="animate-spin text-blue-400" />
                                ) : (
                                    <>
                                        {item.type === 'like' && <Heart size={14} className="text-red-400 fill-red-400" />}
                                        {item.type === 'emoji' && <Smile size={14} className="text-yellow-400" />}
                                        {item.type === 'comment' && <MessageSquare size={14} className="text-blue-400" />}
                                    </>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs leading-relaxed">
                                    <span className="font-bold text-slate-200">{item.username}</span>
                                    {' '}
                                    <span className="text-slate-400">
                                        {item.type === 'like' && 'liked an image'}
                                        {item.type === 'emoji' && `reacted ${item.payload} to an image`}
                                        {item.type === 'comment' && `commented: "${item.payload}"`}
                                    </span>
                                </p>
                                <p className="text-[10px] text-slate-600 mt-1 flex justify-between items-center">
                                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-blue-500 font-medium transition-opacity">View →</span>
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
};

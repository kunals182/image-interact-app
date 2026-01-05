import type { UnsplashImage } from '../services/unsplash';
import { db, isConfigured, type Interaction } from '../config/instant';
import { useUserStore } from '../store/useUserStore';
import { X, Send, Smile, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusedImageViewProps {
    image: UnsplashImage;
    onClose: () => void;
}

const EMOJIS = ['❤️', '🔥', '😂', '😮', '🙌', '✨', '🚀', '💯'];

export const FocusedImageView = ({ image, onClose }: FocusedImageViewProps) => {
    const { username, color } = useUserStore();
    const [comment, setComment] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Query interactions for this image
    const { data } = isConfigured && db ? db.useQuery({
        interactions: {
            $: {
                where: { imageId: image.id },
            },
        }
    }) : { data: null };

    const interactions = (data?.interactions || []) as Interaction[];

    const comments = useMemo(() =>
        interactions
            .filter((i) => i.type === 'comment')
            .sort((a, b) => a.timestamp - b.timestamp),
        [interactions]
    );

    const reactions = useMemo(() =>
        interactions.filter((i) => i.type === 'emoji'),
        [interactions]
    );

    // Group reactions by emoji and track if current user has reacted
    const groupedReactions = useMemo(() =>
        reactions.reduce((acc: Record<string, { count: number; ownId?: string }>, curr) => {
            if (curr.payload) {
                if (!acc[curr.payload]) acc[curr.payload] = { count: 0 };
                acc[curr.payload].count += 1;
                if (curr.username === username) {
                    acc[curr.payload].ownId = curr.id;
                }
            }
            return acc;
        }, {}),
        [reactions, username]
    );

    const handleDelete = useCallback((id: string) => {
        if (!isConfigured || !db) return;
        db.transact(db.tx.interactions[id].delete());
    }, []);

    // Auto-scroll to bottom on new comments
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const handleAddEmoji = useCallback((emoji: string) => {
        if (!isConfigured || !db) return;

        // If user already reacted with this emoji, delete it (toggle behavior)
        const existing = groupedReactions[emoji]?.ownId;
        if (existing) {
            handleDelete(existing);
            return;
        }

        db.transact(
            db.tx.interactions[crypto.randomUUID()].update({
                type: 'emoji',
                imageId: image.id,
                payload: emoji,
                username,
                timestamp: Date.now(),
            })
        );
    }, [isConfigured, db, image.id, username, groupedReactions, handleDelete]);

    const handleSendComment = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !isConfigured || !db) return;

        db.transact(
            db.tx.interactions[crypto.randomUUID()].update({
                type: 'comment',
                imageId: image.id,
                payload: comment.trim(),
                username,
                userColor: color, // Store color for display
                timestamp: Date.now(),
            })
        );
        setComment('');
    }, [comment, isConfigured, db, image.id, username, color]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh] lg:max-h-[90vh] border border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left: Image Side */}
                <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[250px] relative group/image">
                    <img
                        src={image.urls.regular}
                        alt={image.alt_description}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/80">
                        {image.alt_description || 'Unsplash Photography'}
                    </div>
                </div>

                {/* Right: Interaction Side */}
                <div className="w-full lg:w-[450px] flex flex-col bg-slate-900 border-l border-slate-800">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                                {image.user.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-100 leading-none mb-1">{image.user.name}</p>
                                <p className="text-xs text-slate-500">@{image.user.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Reactions */}
                    <div className="p-4 border-b border-slate-800 relative bg-slate-900/30">
                        {!isConfigured && (
                            <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
                                <span className="text-[10px] sm:text-xs font-bold text-amber-500/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest text-center">Config Required for Live sync</span>
                            </div>
                        )}
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Reactions</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {EMOJIS.map((emoji) => {
                                const isOwn = !!groupedReactions[emoji]?.ownId;
                                return (
                                    <button
                                        key={emoji}
                                        onClick={() => handleAddEmoji(emoji)}
                                        disabled={!isConfigured}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all active:scale-90 ${isOwn
                                                ? 'bg-blue-500/20 border border-blue-500/40 ring-1 ring-blue-500/20'
                                                : 'bg-slate-800 hover:bg-slate-700 border border-transparent'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={isOwn ? 'Remove reaction' : 'Add reaction'}
                                    >
                                        {emoji}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {Object.entries(groupedReactions).map(([emoji, data]) => (
                                    <motion.button
                                        key={emoji}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        onClick={() => handleAddEmoji(emoji)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors ${data.ownId
                                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300'
                                            }`}
                                    >
                                        <span className="text-base">{emoji}</span>
                                        <span className="text-xs font-bold">{data.count}</span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950/20"
                    >
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <Smile size={48} className="mb-3 opacity-20" />
                                <p className="text-sm italic font-medium">Be the first to say something!</p>
                            </div>
                        ) : (
                            comments.map((c: Interaction) => (
                                <div key={c.id} className="group/comment flex gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                                        style={{ backgroundColor: c.userColor || '#3b82f6' }}
                                    >
                                        {c.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-extrabold text-slate-200 truncate" style={{ color: c.userColor }}>
                                                {c.username}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500 font-medium">
                                                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {c.username === username && (
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                                        title="Delete your comment"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed break-words">
                                            {c.payload}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <form
                        onSubmit={handleSendComment}
                        className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2"
                    >
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={!isConfigured}
                                placeholder={isConfigured ? "Add a comment..." : "Config required to chat"}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 placeholder:text-slate-600"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!comment.trim() || !isConfigured}
                            className="px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center group active:scale-95"
                        >
                            <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

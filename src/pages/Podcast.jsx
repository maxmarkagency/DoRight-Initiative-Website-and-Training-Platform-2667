import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingTransition from '../components/LoadingTransition';

const { FiPlay, FiPause, FiClock, FiCalendar, FiHeadphones, FiAlertCircle, FiFacebook, FiTwitter, FiLinkedin, FiMessageCircle, FiShare2, FiArrowRight } = FiIcons;

const Podcast = () => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef(new Audio());

    // Placeholder slug - user to update if different
    const PODCAST_SLUG = 'doright';

    useEffect(() => {
        fetchEpisodes();

        // Cleanup audio on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const fetchEpisodes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://public-api.pod.co/podcasts/${PODCAST_SLUG}/episodes`);

            if (!response.ok) {
                throw new Error('Failed to fetch episodes');
            }

            const data = await response.json();
            setEpisodes(data.data || []);
        } catch (err) {
            console.error('Error fetching podcast episodes:', err);
            // For demo purposes, if API fails (likely due to invalid slug), we can show a friendly message
            // or even mock data if preferred. For now we show the error state.
            setError('Unable to load podcast episodes. Please check back later.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (episode) => {
        if (currentEpisode?.id === episode.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setCurrentEpisode(episode);
            setIsPlaying(true);
            audioRef.current = new Audio(episode.url);
            audioRef.current.play().catch(e => {
                console.error("Playback failed", e);
                setIsPlaying(false);
            });

            audioRef.current.onended = () => {
                setIsPlaying(false);
            };
        }
    };

    const formatDuration = (ms) => {
        if (!ms) return '';
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="bg-neural-900 text-white py-20 bg-gradient-to-r from-neutral-900 to-neutral-800">
                <div className="max-w-container mx-auto px-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                            <SafeIcon icon={FiHeadphones} className="w-5 h-5 mr-2 text-accent" />
                            <span className="text-accent font-semibold">DoRight Podcast</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
                            Voices of Integrity
                        </h1>
                        <p className="text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                            Conversations that matter. Tune in to hear stories of leadership, civic action, and the people building a better Nigeria.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="max-w-container mx-auto px-5">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-neutral-200">
                            <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-neutral-800 mb-2">Oops!</h3>
                            <p className="text-neutral-600 mb-4">{error}</p>
                            <button
                                onClick={fetchEpisodes}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Try Again
                            </button>
                            {PODCAST_SLUG === 'doright-initiative' && (
                                <p className="mt-8 text-sm text-neutral-400 max-w-md mx-auto">
                                    Note: This is using a placeholder slug 'doright-initiative'. If you haven't set up the correct slug in the code yet, please update `PODCAST_SLUG` in `src/pages/Podcast.jsx`.
                                </p>
                            )}
                        </div>
                    ) : episodes.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                            <p className="text-xl text-neutral-600">No episodes found. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                            {/* Now Playing Bar - Sticky if playing */}
                            {currentEpisode && (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl p-4 z-50 flex items-center justify-between backdrop-blur-lg bg-white/90"
                                >
                                    <div className="max-w-container mx-auto w-full flex items-center justify-between px-5">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handlePlay(currentEpisode)}
                                                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
                                            >
                                                <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="w-5 h-5 ml-0.5" />
                                            </button>
                                            <div className="hidden sm:block">
                                                <p className="text-sm font-medium text-neutral-500">Now Playing</p>
                                                <p className="text-base font-bold text-neutral-900 line-clamp-1">{currentEpisode.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-neutral-500">
                                            {/* Simple audio visuals or progress could go here */}
                                            <span className="bg-neutral-100 px-3 py-1 rounded-full text-xs font-mono">
                                                {isPlaying ? "Playing..." : "Paused"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {episodes.map((episode) => (
                                <motion.div
                                    key={episode.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 ${currentEpisode?.id === episode.id ? 'border-primary ring-1 ring-primary shadow-md' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="relative group w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-neutral-100">
                                                <img
                                                    src={episode.artwork?.urls?.[0]?.url || 'https://placehold.co/200x200?text=Podcast'}
                                                    alt={episode.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={() => handlePlay(episode)}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                        <SafeIcon icon={currentEpisode?.id === episode.id && isPlaying ? FiPause : FiPlay} className="w-4 h-4 ml-0.5" />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <Link to={`/media/podcast/${episode.slug}`} className="block group">
                                                <h3 className="text-xl font-heading font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                                                    {episode.title}
                                                </h3>
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                                                <div className="flex items-center">
                                                    <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1.5" />
                                                    {formatDate(episode.published_at)}
                                                </div>
                                                <div className="flex items-center">
                                                    <SafeIcon icon={FiClock} className="w-4 h-4 mr-1.5" />
                                                    {formatDuration(episode.duration)}
                                                </div>
                                            </div>
                                            <div
                                                className="text-neutral-600 leading-relaxed mb-4 line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: episode.description }}
                                            />
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handlePlay(episode)}
                                                        className={`inline-flex items-center font-semibold text-sm transition-colors ${currentEpisode?.id === episode.id && isPlaying
                                                            ? 'text-primary'
                                                            : 'text-neutral-900 hover:text-primary'
                                                            }`}
                                                    >
                                                        <SafeIcon icon={currentEpisode?.id === episode.id && isPlaying ? FiPause : FiPlay} className="w-4 h-4 mr-2" />
                                                        {currentEpisode?.id === episode.id && isPlaying ? 'Pause Episode' : 'Play Episode'}
                                                    </button>
                                                    <Link
                                                        to={`/media/podcast/${episode.slug}`}
                                                        className="inline-flex items-center font-semibold text-sm text-neutral-900 hover:text-primary transition-colors"
                                                    >
                                                        View More
                                                        <SafeIcon icon={FiArrowRight} className="w-4 h-4 ml-2" />
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://doright.ng/#/media/podcast/' + episode.slug)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-full bg-[#3b5998]/10 text-[#3b5998] hover:bg-[#3b5998] hover:text-white transition-colors"
                                                        title="Share on Facebook"
                                                    >
                                                        <SafeIcon icon={FiFacebook} className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent('https://doright.ng/#/media/podcast/' + episode.slug)}&text=${encodeURIComponent(episode.title)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-colors"
                                                        title="Share on Twitter"
                                                    >
                                                        <SafeIcon icon={FiTwitter} className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://doright.ng/#/media/podcast/' + episode.slug)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors"
                                                        title="Share on LinkedIn"
                                                    >
                                                        <SafeIcon icon={FiLinkedin} className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/?text=${encodeURIComponent(episode.title + ' https://doright.ng/#/media/podcast/' + episode.slug)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                                                        title="Share on WhatsApp"
                                                    >
                                                        <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
};

export default Podcast;

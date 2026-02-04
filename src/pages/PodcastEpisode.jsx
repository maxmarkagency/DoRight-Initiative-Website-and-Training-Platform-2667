import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiPause, FiClock, FiCalendar, FiHeadphones, FiArrowLeft, FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiLink, FiCheck } = FiIcons;

const PodcastEpisode = () => {
    const { slug } = useParams();
    const [episode, setEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [copied, setCopied] = useState(false);
    const audioRef = React.useRef(new Audio());

    // Placeholder slug - user to update if different. 
    // Ideally this should be in a config file or context, but keeping it here for consistency with Podcast.jsx
    const PODCAST_SLUG = 'doright';

    useEffect(() => {
        fetchEpisode();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [slug]);

    const fetchEpisode = async () => {
        try {
            setLoading(true);
            // Fetch specific episode by slug
            // Note: The Podcast.co API structure typically allows fetching by episode slug under the podcast
            // If direct endpoint isn't available, we might need to fetch all and filter, but let's try direct first 
            // per API docs: /podcasts/{podcast_slug}/episodes/{episode_slug}
            const response = await fetch(`https://public-api.pod.co/podcasts/${PODCAST_SLUG}/episodes/${slug}`);

            if (!response.ok) {
                throw new Error('Failed to fetch episode');
            }

            const data = await response.json();
            // The API might return { data: { ... } } or just the object depending on the endpoint variant
            // Based on previous API usage, it's likely data.data
            setEpisode(data.data);

            // Initialize audio
            if (data.data?.url) {
                audioRef.current = new Audio(data.data.url);
                audioRef.current.onended = () => setIsPlaying(false);
            }

        } catch (err) {
            console.error('Error fetching episode:', err);
            setError('Unable to load episode. It may not exist or the service is down.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = () => {
        if (!audioRef.current.src && episode?.url) {
            audioRef.current.src = episode.url;
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            setIsPlaying(true);
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

    const shareUrl = window.location.href;
    const title = episode?.title || 'DoRight Podcast';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !episode) {
        return (
            <div className="min-h-screen pt-20 pb-12 px-5 bg-neutral-50">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-4">Error Loading Episode</h2>
                    <p className="text-neutral-600 mb-8">{error}</p>
                    <Link to="/programs/podcast" className="text-primary hover:underline">
                        &larr; Back to Podcast List
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-neutral-50">
            {/* Header / Backdrop */}
            <div className="bg-neutral-900 h-64 w-full absolute top-0 left-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-50/0"></div>
            </div>

            <div className="max-w-4xl mx-auto px-5 pt-24 relative z-10 pb-20">
                {/* Back Link */}
                <Link to="/programs/podcast" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
                    <SafeIcon icon={FiArrowLeft} className="w-5 h-5 mr-2" />
                    Back to All Episodes
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Artwork */}
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="w-64 h-64 rounded-lg overflow-hidden shadow-lg relative bg-neutral-200">
                                    <img
                                        src={episode.artwork?.urls?.[0]?.url || 'https://placehold.co/400x400?text=Podcast'}
                                        alt={episode.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-grow text-center md:text-left">
                                <div className="inline-flex items-center text-primary font-medium text-sm mb-3 bg-primary/10 px-3 py-1 rounded-full">
                                    <SafeIcon icon={FiHeadphones} className="w-4 h-4 mr-2" />
                                    Episode {episode.season_number ? `S${episode.season_number} ` : ''}
                                    {episode.number ? `E${episode.number}` : ''}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4 leading-tight">
                                    {episode.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-neutral-500 mb-8">
                                    <div className="flex items-center">
                                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                                        {formatDate(episode.published_at)}
                                    </div>
                                    <div className="flex items-center">
                                        <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
                                        {formatDuration(episode.duration)}
                                    </div>
                                </div>

                                {/* Player Controls */}
                                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-8">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handlePlay}
                                            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow-md flex-shrink-0"
                                        >
                                            <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="w-6 h-6 ml-0.5" />
                                        </button>
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium text-neutral-900 mb-1">
                                                {isPlaying ? "Now Playing" : "Listen Now"}
                                            </p>
                                            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden w-full">
                                                {/* Simple progress bar animation when playing */}
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: isPlaying ? "100%" : "0%" }}
                                                    transition={{ duration: episode.duration ? episode.duration / 1000 : 300, ease: "linear" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Share Buttons */}
                                <div>
                                    <p className="text-sm font-semibold text-neutral-900 mb-3 flex items-center justify-center md:justify-start">
                                        <SafeIcon icon={FiShare2} className="w-4 h-4 mr-2" />
                                        Share Episode
                                    </p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors">
                                            <SafeIcon icon={FiFacebook} className="w-5 h-5" />
                                        </a>
                                        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-colors">
                                            <SafeIcon icon={FiTwitter} className="w-5 h-5" />
                                        </a>
                                        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors">
                                            <SafeIcon icon={FiLinkedin} className="w-5 h-5" />
                                        </a>
                                        <button onClick={handleCopyLink} className="p-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors relative">
                                            <SafeIcon icon={copied ? FiCheck : FiLink} className="w-5 h-5" />
                                            {copied && (
                                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-90 whitespace-nowrap">
                                                    Copied!
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-12 pt-8 border-t border-neutral-200">
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">Episode Notes</h3>
                            <div
                                className="prose prose-lg max-w-none text-neutral-700"
                                dangerouslySetInnerHTML={{ __html: episode.description }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PodcastEpisode;

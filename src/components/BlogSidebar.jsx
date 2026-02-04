import React from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube } = FiIcons;

const BlogSidebar = ({ recentPosts = [] }) => {
    const categories = [
        { name: 'Fashion', count: 12 },
        { name: 'Lifestyle', count: 8 },
        { name: 'Health', count: 5 },
        { name: 'Travel', count: 9 },
    ];

    const tags = ['FASHION', 'HEALTH', 'TECHNOLOGY', 'LIFESTYLE', 'FOOD', 'TRAVEL', 'PHOTOGRAPHY', 'DESIGN', 'NATURE', 'MUSIC', 'ART'];

    const socialLinks = [
        { icon: FiInstagram, name: 'Instagram', bg: 'bg-pink-100', text: 'text-pink-600', link: '#' },
        { icon: FiTwitter, name: 'Twitter', bg: 'bg-blue-100', text: 'text-blue-500', link: '#' },
        { icon: FiFacebook, name: 'Facebook', bg: 'bg-blue-50', text: 'text-blue-700', link: '#' },
        { icon: FiYoutube, name: 'Youtube', bg: 'bg-red-100', text: 'text-red-600', link: '#' },
        { icon: FiLinkedin, name: 'Linkedin', bg: 'bg-blue-50', text: 'text-blue-800', link: '#' },
    ];

    return (
        <aside className="space-y-8">
            {/* Social Networks Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <h3 className="text-xl font-heading font-bold mb-6 relative inline-block">
                    Social Networks
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
                </h3>
                <div className="space-y-3">
                    {socialLinks.map((social) => (
                        <a key={social.name} href={social.link} className={`flex items-center p-3 rounded-lg transition-colors hover:bg-neutral-50 ${social.bg}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-white ${social.text}`}>
                                <SafeIcon icon={social.icon} className="w-4 h-4" />
                            </div>
                            <span className={`font-medium ${social.text}`}>{social.name}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <h3 className="text-xl font-heading font-bold mb-6 relative inline-block">
                    Categories
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
                </h3>
                <ul className="space-y-4">
                    {categories.map(category => (
                        <li key={category.name}>
                            <Link to={`/blog?category=${category.name}`} className="flex items-center justify-between group">
                                <span className="text-neutral-600 group-hover:text-primary transition-colors flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-neutral-300 mr-3 group-hover:bg-primary transition-colors"></span>
                                    {category.name}
                                </span>
                                <span className="bg-neutral-100 text-neutral-500 text-xs px-2 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                    {category.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Recent Posts Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <h3 className="text-xl font-heading font-bold mb-6 relative inline-block">
                    Popular Posts
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
                </h3>
                <div className="space-y-6">
                    {recentPosts.slice(0, 4).map((post, index) => (
                        <Link to={`/blog/${post.id}`} key={index} className="flex gap-4 group">
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden relative">
                                <img src={post.image || 'https://placehold.co/100x100'} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute top-0 left-0 w-6 h-6 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-br-lg">
                                    {index + 1}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-800 leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <span className="text-xs text-neutral-500">
                                    {new Date(post.date).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))}
                    {recentPosts.length === 0 && (
                        <p className="text-sm text-neutral-500">No recent posts found.</p>
                    )}
                </div>
            </div>

            {/* Tag Cloud Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <h3 className="text-xl font-heading font-bold mb-6 relative inline-block">
                    Tag Cloud
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Link
                            key={tag}
                            to={`/blog?tag=${tag}`}
                            className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all uppercase"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Ad/Promo Widget */}
            <div className="rounded-lg overflow-hidden relative group">
                <img src="https://placehold.co/600x800/1e293b/ffffff?text=Ad+Space" alt="Advertisement" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">Learn More</span>
                </div>
            </div>

        </aside>
    );
};

export default BlogSidebar;

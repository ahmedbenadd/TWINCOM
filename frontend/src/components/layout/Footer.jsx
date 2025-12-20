import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-950 text-white pt-16 pb-8 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="col-span-1">
                        <h3 className="text-2xl font-bold tracking-tighter mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">TWINCOM</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Elevating your lifestyle with premium electronics. We curate the latest gadgets to keep you ahead of the curve.
                        </p>
                        <div className="flex space-x-5">
                            <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors duration-300"><Facebook size={22} /></a>
                            <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors duration-300"><Twitter size={22} /></a>
                            <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors duration-300"><Instagram size={22} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-6">Shop</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link to="/shop?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
                            <li><Link to="/shop?sort=price_desc" className="hover:text-white transition-colors">Featured</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-6">Support</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Shipping Information</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-6">Get in Touch</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start group">
                                <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-gray-800 transition mr-3">
                                    <MapPin size={18} className="text-indigo-400" />
                                </div>
                                <span className="pt-1">123 Tech Street, Suite 500<br />San Francisco, CA 94107</span>
                            </li>
                            <li className="flex items-start group">
                                <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-gray-800 transition mr-3">
                                    <Phone size={18} className="text-indigo-400" />
                                </div>
                                <span className="pt-1">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start group">
                                <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-gray-800 transition mr-3">
                                    <Mail size={18} className="text-indigo-400" />
                                </div>
                                <span className="pt-1">support@twincom.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} TWINCOM. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-300">Terms</a>
                        <a href="#" className="hover:text-gray-300">Privacy</a>
                        <a href="#" className="hover:text-gray-300">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

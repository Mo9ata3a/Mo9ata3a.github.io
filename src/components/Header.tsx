import React, { useState } from 'react';
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';
import { ContributionModal } from './ContactModal';
import { FeedbackModal } from './FeedbackModal';

const socialLinks = [
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: Facebook,
    baseColor: 'bg-gray-800 text-blue-400',
    hoverColor: 'hover:bg-blue-600 hover:text-white',
  },
  {
    href: 'https://twitter.com',
    label: 'Twitter',
    icon: Twitter,
    baseColor: 'bg-gray-800 text-blue-400',
    hoverColor: 'hover:bg-blue-500 hover:text-white',
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: Instagram,
    baseColor: 'bg-gray-800 text-pink-400',
    hoverColor: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white',
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    icon: Youtube,
    baseColor: 'bg-gray-800 text-red-400',
    hoverColor: 'hover:bg-red-600 hover:text-white',
  },
];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-2 md:py-2.5">
        <div className="flex justify-between items-center">
          {/* Logo / Brand placeholder */}
          <div className="flex items-center">
            {/* Uncomment and customize your logo here */}
            {/* <a href="/" className="text-blue-600 font-bold text-xl md:text-2xl">MonSite</a> */}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
  <button
    onClick={() => setIsContactModalOpen(true)}
    className="
      bg-blue-600 
      text-white 
      font-semibold 
      px-5 py-2.5 
      rounded-full 
      shadow-lg 
      hover:bg-blue-700 
      focus:outline-none 
      focus:ring-4 
      focus:ring-blue-300 
      transition 
      duration-300 
      transform 
      hover:scale-105
      cursor-pointer
    "
    aria-label="Ouvrir le formulaire de contribution"
  >
    Contribuer
  </button>
</nav>


          {/* Social media icons */}
          <div className="hidden md:flex space-x-4">
            {socialLinks.map(({ href, label, icon: Icon, baseColor, hoverColor }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`${baseColor} ${hoverColor} p-2 rounded-full transition-all duration-300 transform hover:scale-110`}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 pt-2 border-t border-gray-100 animate-fadeIn">
            <ul className="space-y-3">
              <li>
                <button
                  className="flex items-center w-full py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => {
                    setIsContactModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  <span>Contribuer</span>
                </button>
              </li>
              {/* Add more mobile menu items here if needed */}
            </ul>
          </nav>
        )}
      </div>

      {/* Modals */}
      <ContributionModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </header>
  );
};

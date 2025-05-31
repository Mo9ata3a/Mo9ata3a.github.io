import React, { useState } from 'react';
import { Menu, X, MessageSquare, Phone, ChevronDown } from 'lucide-react';
import { ContactModal } from './ContactModal';
import { FeedbackModal } from './FeedbackModal';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="text-blue-600 font-bold text-xl md:text-2xl">
            <img 
      src="./logo.png"  /* Remplacez par le chemin de votre image */
      alt="Badayli Logo" 
      className="h-8 w-8 mr-2"  /* Ajustez la taille et la marge selon vos besoins */
    />
              Badayli
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
           {/*  <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
              Accueil
            </a>
            <a href="/products" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
              Produits
            </a> */}
            
            <div className="relative group">
              <button 
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
                onClick={() => setIsContactModalOpen(true)}
              >
                <span>Contact</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>Feedback</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 pt-2 border-t border-gray-100 animate-fadeIn">
            <ul className="space-y-3">
              <li>
                <a 
                  href="/" 
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </a>
              </li>
              <li>
                <a 
                  href="/products" 
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Produits
                </a>
              </li>
              <li>
                <button 
                  className="flex items-center w-full py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => {
                    setIsContactModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  <span>Contact</span>
                </button>
              </li>
              <li>
                <button 
                  className="flex items-center w-full py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => {
                    setIsFeedbackModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Feedback</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Modals */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </header>
  );
};
import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  MessageSquare, 
  Phone
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
        {/*   <div className="space-y-4">
            <h3 className="text-lg font-semibold">ProSearch</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Notre moteur de recherche de produits vous aide à trouver exactement ce que vous cherchez, rapidement et facilement.
            </p>
          </div> */}

          {/* Quick Links */}
        {/*   <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                  Produits
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                  À propos
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div> */}

          {/* Contact Info */}
           <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>badayli@protonmail.com</span>
              </li>
            </ul>
          </div> 

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 text-blue-400 hover:bg-blue-500 hover:text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 text-pink-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 text-blue-400 hover:bg-blue-700 hover:text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 text-red-400 hover:bg-red-600 hover:text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Suivez-nous sur les réseaux sociaux pour les dernières nouvelles et mises à jour.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ProSearch. Tous droits réservés.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4 text-xs text-gray-500">
              <li>
                <a href="/privacy" className="hover:text-blue-400 transition-colors duration-200">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-400 transition-colors duration-200">
                  Termes
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-blue-400 transition-colors duration-200">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
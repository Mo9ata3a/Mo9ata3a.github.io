import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { Toast } from './Toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Veuillez entrer votre feedback');
      return;
    }
    
    if (rating === null) {
      setError('Veuillez sélectionner une évaluation');
      return;
    }
    
    if (!category) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }
    
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { feedback, rating, category });
    
    // Show success message
    setShowToast(true);
    
    // Reset form
    setFeedback('');
    setRating(null);
    setCategory('');
    setError('');
    
    // Close modal after a delay
    setTimeout(() => {
      onClose();
      setTimeout(() => setShowToast(false), 300);
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto animate-scaleIn">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Donnez-nous votre avis</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Comment évaluez-vous notre service ?</p>
                <div className="flex justify-center gap-8 mt-3">
                  <button
                    type="button"
                    onClick={() => setRating(1)}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      rating === 1 
                        ? 'bg-red-100 text-red-600 scale-110' 
                        : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                    }`}
                    aria-label="Pas satisfait"
                  >
                    <ThumbsDown size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(5)}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      rating === 5 
                        ? 'bg-green-100 text-green-600 scale-110' 
                        : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-500'
                    }`}
                    aria-label="Satisfait"
                  >
                    <ThumbsUp size={24} />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="interface">Interface utilisateur</option>
                <option value="performance">Performance</option>
                <option value="search">Recherche de produits</option>
                <option value="suggestions">Suggestions d'amélioration</option>
                <option value="bug">Signalement de bug</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Votre feedback
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Partagez votre expérience ou vos suggestions..."
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Send size={18} className="mr-2" />
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {showToast && (
        <Toast 
          message="Merci pour votre feedback !" 
          type="success" 
          onClose={() => setShowToast(false)} 
        />
      )}
    </>
  );
};
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Toast } from './Toast';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    productName: '',
    altName: '',
    altDesc: '',
    rating: '',
    altImage: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    if (!formData.productName.trim()) newErrors.productName = 'Le nom du produit est requis';
    //if (!formData.altName.trim()) newErrors.altName = 'Le nom alternatif est requis';
    //if (!formData.altDesc.trim()) newErrors.altDesc = 'La description est requise';
    
    if (!formData.rating) {
      formData.rating='1';
      //newErrors.rating = 'La note est requise';
    } else {
      const ratingNum = Number(formData.rating);
      if (isNaN(ratingNum)) {
        newErrors.rating = 'La note doit être un nombre';
      } else if (ratingNum < 1 || ratingNum > 5) {
        newErrors.rating = 'La note doit être entre 1 et 5';
      }
    }
    
    /* if (!formData.altImage.trim()) {
      newErrors.altImage = "L'URL de l'image est requise";
    } else if (!urlRegex.test(formData.altImage)) {
      newErrors.altImage = 'URL invalide';
    } */
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://mon-api-three.vercel.app/api/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: formData.productName,
          altName: formData.altName,
          altDesc: formData.altDesc,
          rating: Number(formData.rating),
          altImage: formData.altImage
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setToastMessage('Merci pour ta contribution !');
        setToastType('success');
        setShowToast(true);
        
        // Réinitialiser le formulaire
        setFormData({
          productName: '',
          altName: '',
          altDesc: '',
          rating: '',
          altImage: ''
        });
        
        // Fermer le modal après délai
        setTimeout(() => {
          onClose();
          setTimeout(() => setShowToast(false), 300);
        }, 2000);
      } else {
        throw new Error(result.error || 'Erreur lors de la contribution');
      }
    } catch (error) {
      setToastMessage(error.message || "Une erreur s'est produite");
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto animate-scaleIn">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Contribuer à la base</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit*
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.productName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom original du produit"
              />
              {errors.productName && <p className="mt-1 text-sm text-red-500">{errors.productName}</p>}
            </div>
            
            <div>
              <label htmlFor="altName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom alternatif(Facultatif)
              </label>
              <input
                type="text"
                id="altName"
                name="altName"
                value={formData.altName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.altName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Proposition de nom alternatif"
              />
              {errors.altName && <p className="mt-1 text-sm text-red-500">{errors.altName}</p>}
            </div>
            
            <div>
              <label htmlFor="altDesc" className="block text-sm font-medium text-gray-700 mb-1">
                Description alternative (Facultatif)
              </label>
              <textarea
                id="altDesc"
                name="altDesc"
                value={formData.altDesc}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.altDesc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Description humoristique ou alternative"
              />
              {errors.altDesc && <p className="mt-1 text-sm text-red-500">{errors.altDesc}</p>}
            </div>
            
           {/*  <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                Note (1-5)*
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="1"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.rating ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Note entre 1 et 5"
              />
              {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating}</p>}
            </div> */}
            
            <div>
              <label htmlFor="altImage" className="block text-sm font-medium text-gray-700 mb-1">
                URL de l'image alternative (Facultatif)
              </label>
              <input
                type="url"
                id="altImage"
                name="altImage"
                value={formData.altImage}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.altImage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.altImage && <p className="mt-1 text-sm text-red-500">{errors.altImage}</p>}
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Contribuer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </>
  );
};
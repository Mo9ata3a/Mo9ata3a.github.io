import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Toast } from './Toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      
      // Show success message
      setShowToast(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setTimeout(() => setShowToast(false), 300); // Hide toast after modal closes
      }, 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto animate-scaleIn">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Contactez-nous</h2>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Votre nom"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="badayli@protonmail.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="information">Demande d'information</option>
                <option value="support">Support technique</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </select>
              {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Votre message..."
              />
              {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
            </div>
            
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
          message="Message envoyé avec succès !" 
          type="success" 
          onClose={() => setShowToast(false)} 
        />
      )}
    </>
  );
};
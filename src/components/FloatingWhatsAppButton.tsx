import React from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { useContent } from '../context/ContentContext';

export const FloatingWhatsAppButton: React.FC = () => {
  const { siteConfig } = useContent();
  const phone = (siteConfig.whatsappPhone || siteConfig.hotlinePhone).replace(/\D/g, '');
  const message = siteConfig.whatsappMessage || 'Hello MommyCare, I would like help finding vetted homecare staff.';
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with MommyCare on WhatsApp"
      title="Chat with MommyCare on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#128C7E]/30 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/35"
    >
      <SiWhatsapp className="h-8 w-8" aria-hidden="true" />
    </a>
  );
};
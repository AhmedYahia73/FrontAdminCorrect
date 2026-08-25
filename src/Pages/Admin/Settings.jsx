import React from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function Settings() {
  const { settings, isLoading } = useSettings();
  
  const handleDownload = async () => {
    try {
      const response = await fetch(settings.qr_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'project_qr_code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading the image:', error);
      window.open(settings.qr_url, '_blank');
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(settings.qr_url);
      const blob = await response.blob();
      const file = new File([blob], 'project_qr_code.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Project QR Code',
          text: 'Here is the QR code for our certificates portal:',
          files: [file],
        });
      } else {
        // Fallback if browser doesn't support file sharing
        const text = `Here is the QR code for our certificates portal:\n${window.location.origin}\n\nDirect QR Link: ${settings.qr_url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      const text = `Here is the QR code for our certificates portal:\n${window.location.origin}\n\nDirect QR Link: ${settings.qr_url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
        <h2 className="text-2xl font-bold text-foreground">Project QR Code</h2>
        <p className="text-sm text-muted-foreground mt-1">Scan, download or share the project QR code.</p>
      </div>

      {settings?.qr_url ? (
        <div className="bg-card border border-border rounded-xl p-12 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-md inline-block mb-10">
            <img src={settings.qr_url} alt="Project QR Code" className="w-64 h-64 md:w-96 md:h-96 object-contain" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg">
            <button 
              onClick={handleShare}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">share</span>
              Share on WhatsApp
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">download</span>
              Download QR
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 shadow-sm text-center text-muted-foreground">
          No QR Code available.
        </div>
      )}
    </div>
  );
}

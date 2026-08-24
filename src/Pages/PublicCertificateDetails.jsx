import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export default function PublicCertificateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: cert, isLoading, isError } = useQuery({
    queryKey: ['public-certificate', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/certificate/${id}`);
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading certificate details...</p>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
        <p className="text-destructive mb-4">Certificate not found or invalid.</p>
        <button onClick={() => navigate('/')} className="text-primary hover:underline">
          Return to Certificates
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground bg-card border border-border"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Certificate Details</h2>
            <p className="text-sm text-muted-foreground">ID: {cert.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm text-muted-foreground mb-1">Company Name</span>
                  <span className="block text-base font-medium">{cert.company_name}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground mb-1">Certificate Name</span>
                  <span className="block text-base font-medium">{cert.certificate_name}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground mb-1">Issue Date</span>
                  <span className="block text-base font-medium">{new Date(cert.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Certificate Images</h3>
              {cert.images_urls && cert.images_urls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cert.images_urls.map((url, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-border bg-muted group relative">
                      <img src={url} alt={`Certificate Image ${idx + 1}`} className="w-full h-auto object-contain" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                          View Full Screen
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No images attached to this certificate.</p>
              )}
            </div>
          </div>

          {/* Sidebar details */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-lg font-bold text-foreground mb-4">QR Code</h3>
              <div className="bg-white p-2 border border-border rounded-lg inline-block shadow-sm">
                <img src={cert.qr_url} alt="QR Code" className="w-40 h-40 object-contain" />
              </div>
              <div className="mt-4 flex gap-2">
                <a 
                  href={cert.qr_url} 
                  download 
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

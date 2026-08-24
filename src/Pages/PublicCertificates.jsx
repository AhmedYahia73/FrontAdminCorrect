import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/axios';

export default function PublicCertificates() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['public-certificates', page, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/admin/certificate', {
        params: { page, limit: 12, search: debouncedSearch }
      });
      return res.data?.data || { certificates: [], pagination: { totalPages: 1 } };
    },
    keepPreviousData: true,
  });

  const certsData = Array.isArray(data) ? data : data?.certificates || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Verified Certificates</h2>
            <p className="text-sm text-muted-foreground mt-1">Search and view officially issued certificates.</p>
          </div>
          <div className="w-full sm:w-72">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search certificates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {certsData.length > 0 ? (
                certsData.map((cert) => (
                  <div 
                    key={cert.id} 
                    onClick={() => navigate(`/certificate/${cert.id}`)}
                    className="bg-card border border-border rounded-xl p-4 flex flex-col relative overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent -z-10 rounded-tr-xl"></div>
                    
                    {cert.images_urls && cert.images_urls.length > 0 && (
                      <div className="w-full h-40 mb-4 rounded-lg overflow-hidden border border-border">
                        <img src={cert.images_urls[0]} alt="Certificate Cover" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground leading-tight mb-1">{cert.certificate_name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.company_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-y-3 mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <a href={cert.qr_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-12 h-12 border-2 border-primary/10 rounded p-1 bg-white hover:border-primary transition-colors cursor-zoom-in block" title="View QR Fullscreen">
                          <img src={cert.qr_url} alt="QR" className="w-full h-full object-contain" />
                        </a>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">Date</span>
                          <span className="text-sm font-medium">{new Date(cert.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No certificates found.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background flex flex-col font-['Raleway',sans-serif]">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap');
          
          @keyframes slideRight {
            0% { opacity: 0; transform: translateX(-30px); clip-path: inset(0 100% 0 0); }
            100% { opacity: 1; transform: translateX(0); clip-path: inset(0 0 0 0); }
          }
          .animate-slide-right {
            animation: slideRight 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
          }
        `}
      </style>

      {/* Header Top */}
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
        <a href="https://correctsolution.net/">
          <img src="https://correctsolution.net/wp-content/uploads/2019/12/logo-02-1.png" alt="Correct Solution" className="w-[180px] h-auto" />
        </a>
        <div className="flex flex-col sm:flex-row gap-6 text-[#0e689c] font-medium text-[15px]">
          <a href="mailto:Info@correctsolution.net" className="flex items-center gap-2 hover:text-[#ff9018] transition-colors">
            <span className="material-symbols-outlined text-[22px]">mail</span>
            Info@correctsolution.net
          </a>
          <a href="tel:01002220108" className="flex items-center gap-2 hover:text-[#ff9018] transition-colors">
            <span className="material-symbols-outlined text-[22px]">call</span>
            +201002220108
          </a>
        </div>
      </div>

      {/* Navbar - matching header_3 design with skewed left edge */}
      <div className="relative flex justify-end overflow-hidden">
        {/* The skewed blue nav section */}
        <div className="relative bg-[#0e689c] flex items-center" style={{clipPath: 'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%)'}}>
          <ul className="flex items-center pl-16 pr-6">
            {[
              { label: 'HOME', href: 'https://correctsolution.net/' },
              { label: 'ABOUT', href: 'https://correctsolution.net/about-us/' },
              { label: 'SERVICES', href: 'https://correctsolution.net/services/' },
              { label: 'TRAINING', href: '#' },
              { label: 'CAREER', href: 'https://correctsolution.net/career/' },
              { label: 'CONTACT', href: 'https://correctsolution.net/contact-us/' },
              { label: 'CERTIFICATE', href: '#', active: true },
            ].map(({ label, href, active }) => (
              <li key={label} className="nav-item-3 relative group">
                <a
                  href={href}
                  className={`relative block px-4 py-5 text-[15px] font-semibold tracking-wide transition-colors duration-200 ${
                    active ? 'text-white' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {/* Orange top bar */}
                  <span
                    className={`absolute top-0 left-0 h-[5px] bg-[#ff9018] transition-all duration-300 ${
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Slider / Hero */}
      <div className="relative w-full h-[400px] md:h-[570px] bg-[#01131c] flex items-center overflow-hidden">
        <img 
          src="https://correctsolution.net/wp-content/uploads/2019/11/slide1.jpg" 
          alt="Slider Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" 
        />
        <div className="container mx-auto px-4 sm:px-12 relative z-10">
          <h1 className="text-white text-5xl md:text-[60px] font-extrabold uppercase leading-tight tracking-wide font-['Raleway']">
            <span className="block animate-slide-right opacity-0" style={{ animationDelay: '0.2s' }}>CERTIFICATE</span>
          </h1>
        </div>
      </div>

      {/* Certificates Content */}
      <div className="flex-grow p-6 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto space-y-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Verified Certificates</h2>
              <p className="text-sm text-gray-500 mt-1">Search and view officially issued certificates.</p>
            </div>
            <div className="w-full sm:w-72">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-[#0e689c] outline-none transition-shadow"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {certsData.length > 0 ? (
                  certsData.map((cert) => (
                    <div 
                      key={cert.id} 
                      onClick={() => navigate(`/certificate/${cert.id}`)}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col relative overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0e689c]/10 to-transparent -z-10 rounded-tr-xl"></div>
                      
                      {cert.images_urls && cert.images_urls.length > 0 && (
                        <div className="w-full h-40 mb-4 rounded-lg overflow-hidden border border-gray-200">
                          <img src={cert.images_urls[0]} alt="Certificate Cover" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 leading-tight mb-1">{cert.certificate_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1.5 font-medium">
                            <span className="flex items-center gap-1 text-[#0e689c]/90">
                              <span className="material-symbols-outlined text-[16px]">domain</span>
                              {cert.company_name}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                              {new Date(cert.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No certificates found.
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <span className="text-sm font-medium text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/axios';

const NAV_LINKS = [
  { label: 'HOME',        href: 'https://correctsolution.net/' },
  { label: 'ABOUT',       href: 'https://correctsolution.net/about-us/' },
  { label: 'SERVICES',    href: 'https://correctsolution.net/services/' },
  { label: 'TRAINING',    href: '#' },
  { label: 'CAREER',      href: 'https://correctsolution.net/career/' },
  { label: 'CONTACT',     href: 'https://correctsolution.net/contact-us/' },
  { label: 'CERTIFICATE', href: '#', active: true },
];

export default function PublicCertificates() {
  const navigate = useNavigate();
  const [page, setPage]                       = useState(1);
  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [hoveredNav, setHoveredNav]           = useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['public-certificates', page, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/admin/certificate', {
        params: { page, limit: 12, search: debouncedSearch },
      });
      return res.data?.data || { certificates: [], pagination: { totalPages: 1 } };
    },
    keepPreviousData: true,
  });

  const certsData  = Array.isArray(data) ? data : data?.certificates || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Raleway, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap');

        @keyframes blockFromLeft {
          0%   { opacity: 0; clip-path: inset(0 100% 0 0); transform: translateX(-15px); }
          100% { opacity: 1; clip-path: inset(0 0% 0 0);   transform: translateX(0); }
        }
        .slide-in { animation: blockFromLeft 1.2s cubic-bezier(0.77,0,0.175,1) 0.2s both; }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          height: 5px;
          background: #ff9018;
          width: 0;
          transition: width 0.28s ease;
        }
        .nav-link:hover::before,
        .nav-link.is-active::before { width: 100%; }
        .nav-link:hover { color: #fff !important; }
      `}</style>

      {/* ─────────────────────────────────────────────
          DESKTOP HEADER  (header_2)
      ───────────────────────────────────────────── */}
      <div className="hidden lg:block bg-white h-[65px] relative z-50">
        <div className="max-w-[1200px] mx-auto px-5 pt-10 flex justify-between items-center h-full">
          <a href="https://correctsolution.net/" className="block" style={{ marginTop: 5, marginBottom: 0 }}>
            <img src="https://correctsolution.net/wp-content/uploads/2019/12/logo-02-1.png" alt="Correct Solution" style={{ width: 180 }} />
          </a>

          <div className="flex items-center" style={{ marginTop: 0, marginBottom: 45 }}>
            <a href="mailto:Info@correctsolution.net" className="flex items-center gap-[5px] no-underline font-medium text-[15px] text-[#0e689c] hover:text-[#ff9018] transition-colors" style={{ marginRight: 10 }}>
              <i className="fa-regular fa-envelope" style={{ fontSize: '22px', marginRight: '5px' }}></i> Info@correctsolution.net
            </a>
            <a href="tel:+201002220108" className="flex items-center gap-[5px] no-underline font-medium text-[15px] text-[#0e689c] hover:text-[#ff9018] transition-colors" style={{ marginRight: 30 }}>
              <i className="fa-solid fa-phone-volume" style={{ fontSize: '20px', marginRight: '5px' }}></i> +201002220108
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          DESKTOP NAVBAR  (header_3)
      ───────────────────────────────────────────── */}
      <div 
        className="hidden lg:flex relative justify-end z-40 pointer-events-none"
        style={{ marginTop: '-10px', marginBottom: '-40px' }}
      >
        <nav
          className="bg-[#0e689c] flex w-full max-w-[1100px] pointer-events-auto h-20"
          style={{ clipPath: 'polygon(75px 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        >
          <ul className="flex items-center justify-center list-none m-0 w-full h-full" style={{ paddingLeft: 80 }}>
            {NAV_LINKS.map(({ label, href, active }) => (
              <li key={label} className="relative h-full" style={{ listStyle: 'none' }}>
                <a
                  href={href}
                  onMouseEnter={() => setHoveredNav(label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative flex items-center justify-center h-full no-underline font-semibold tracking-[0.3px] transition-colors"
                  style={{
                    fontSize: 16,
                    padding: '0',
                    marginLeft: 16,
                    marginRight: 16,
                    color: (active || hoveredNav === label) ? '#ffffff' : 'rgba(255,255,255,0.85)',
                  }}
                >
                  {/* Top orange bar — top:-10px like original #menu_header_3 > .cz > a:before */}
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    left: 0,
                    height: '5px',
                    backgroundColor: '#ff9018',
                    width: (active || hoveredNav === label) ? '100%' : '0%',
                    transition: 'width 0.28s ease',
                  }} />
                  {label}
                </a>
              </li>
            ))}
            {/* Search Icon */}
            <li className="relative ml-2 flex items-center h-full" style={{ listStyle: 'none' }}>
              <a href="#" className="text-white hover:text-[#ff9018] transition-colors">
                <i className="fa-solid fa-search" style={{ fontSize: '18px' }}></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* ─────────────────────────────────────────────
          MOBILE HEADER
      ───────────────────────────────────────────── */}
      <div className="lg:hidden bg-[#0e689c] relative z-50 shadow-md">
        <div className="flex justify-between items-center px-4 py-3">
          <a href="https://correctsolution.net/" className="block bg-white p-2 rounded">
            <img src="https://correctsolution.net/wp-content/uploads/2019/12/logo-02-1.png" alt="Correct Solution" style={{ width: 130 }} />
          </a>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="text-white hover:text-[#ff9018] transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? (
              <i className="fa-solid fa-times text-[32px]"></i>
            ) : (
              <i className="fa-solid fa-bars text-[28px]"></i>
            )}
          </button>
        </div>
        
        {/* Mobile Dropdown Menu */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <ul className="flex flex-col list-none m-0 p-0 border-t border-white/10 bg-[#0b547d]">
            {NAV_LINKS.map(({ label, href, active }) => (
              <li key={label} className="border-b border-white/5 last:border-0">
                <a
                  href={href}
                  className={`block px-6 py-4 font-semibold tracking-[0.3px] ${active ? 'text-[#ff9018]' : 'text-white/85'} hover:bg-black/10`}
                  style={{ fontSize: 15 }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          HERO / SLIDER
      ───────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ height: 'auto', minHeight: 400, backgroundColor: '#01131c' }}>
        <img
          src="https://correctsolution.net/wp-content/uploads/2019/11/slide1.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.65, transform: 'scale(1.06)' }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(1,19,28,0.2)' }} />

        <div className="relative z-10 text-center w-full px-6">
          <h1
            className="slide-in m-0 text-white uppercase text-[36px] lg:text-[46px]"
            style={{ fontWeight: 700, fontFamily: 'Raleway, sans-serif', letterSpacing: 1, lineHeight: 1.15 }}
          >
            CERTIFICATE
          </h1>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          CERTIFICATES CONTENT
      ───────────────────────────────────────────── */}
      <div className="flex-grow bg-[#f9fafb] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 md:mt-6">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Verified Certificates</h2>
              <p className="text-sm text-gray-500 mt-1">Search and view officially issued certificates.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]"></i>
              <input
                type="text"
                placeholder="Search certificates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-[#0e689c] outline-none transition-shadow text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {certsData.length > 0 ? certsData.map(cert => (
                  <div
                    key={cert.id}
                    onClick={() => navigate(`/certificate/${cert.id}`)}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col relative overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0e689c]/10 to-transparent -z-10 rounded-tr-xl" />

                    {cert.images_urls?.length > 0 && (
                      <div className="w-full h-40 mb-4 rounded-lg overflow-hidden border border-gray-200">
                        <img src={cert.images_urls[0]} alt="Certificate" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h3 className="text-[17px] font-semibold text-gray-800 leading-snug mb-2">{cert.certificate_name}</h3>
                    <div className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1 text-[#0e689c]">
                        <i className="fa-regular fa-building text-[14px]"></i>
                        {cert.company_name}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <i className="fa-regular fa-calendar-alt text-[14px]"></i>
                        {new Date(cert.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-gray-500">No certificates found.</div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <i className="fa-solid fa-chevron-left text-[16px]"></i>
                  </button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <i className="fa-solid fa-chevron-right text-[16px]"></i>
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

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';

export default function Certificates() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['certificates', page, debouncedSearch],
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

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/admin/certificate/${id}`),
    onSuccess: () => {
      toast.success('Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const openAddModal = (e) => {
    if(e) e.stopPropagation();
    setEditingCert(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cert, e) => {
    if(e) e.stopPropagation();
    setEditingCert(cert);
    setIsModalOpen(true);
  };

  const handleDelete = (id, e) => {
    if(e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this certificate?')) {
      deleteMutation.mutate(id);
    }
  };
  const handleShare = async (cert, e) => {
    if(e) e.stopPropagation();
    try {
      // Force https to avoid mixed-content block (frontend is https, backend URL may be http)
      const secureQrUrl = cert.qr_url.replace(/^http:\/\//i, 'https://');
      const response = await fetch(secureQrUrl);
      const blob = await response.blob();
      const file = new File([blob], `${cert.certificate_name}_qr.png`, { type: blob.type });
      const text = `New certificate issued:\nCompany: ${cert.company_name}\nCertificate: ${cert.certificate_name}\n\nLink: ${window.location.origin}/certificate/${cert.id}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: cert.certificate_name,
          text: text,
          files: [file],
        });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      const text = `New certificate issued:\nCompany: ${cert.company_name}\nCertificate: ${cert.certificate_name}\n\nLink: ${window.location.origin}/certificate/${cert.id}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Certificates Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track approved certificates.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search certificates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow"
            />
          </div>
          <button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Certificate
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {certsData?.map((cert) => (
              <div 
                key={cert.id} 
                onClick={() => navigate(`/admin/certificates/${cert.id}`)}
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5 font-medium">
                      <span className="flex items-center gap-1 text-primary/80">
                        <span className="material-symbols-outlined text-[16px]">domain</span>
                        {cert.company_name}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {new Date(cert.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-y-3 mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <a href={cert.qr_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-12 h-12 border-2 border-primary/10 rounded p-1 bg-white hover:border-primary transition-colors cursor-zoom-in block" title="View QR Fullscreen">
                      <img src={cert.qr_url} alt="QR" className="w-full h-full object-contain" />
                    </a>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={(e) => handleShare(cert, e)} className="w-8 h-8 flex items-center justify-center rounded border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors shrink-0" title="Share via WhatsApp">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <button onClick={(e) => openEditModal(cert, e)} className="w-8 h-8 flex items-center justify-center rounded border border-primary text-primary hover:bg-primary hover:text-white transition-colors shrink-0" title="Edit">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={(e) => handleDelete(cert.id, e)} className="w-8 h-8 flex items-center justify-center rounded border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors shrink-0" title="Delete">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {certsData?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No certificates found.
              </div>
            )}
          </div>

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

      {isModalOpen && (
        <CertificateModal
          cert={editingCert}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function CertificateModal({ cert, onClose }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: cert ? {
      company_name: cert.company_name,
      certificate_name: cert.certificate_name,
      date: new Date(cert.date).toISOString().split('T')[0],
    } : {}
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // For images, we should convert them to base64 if selected
      const payload = { ...data, images: [] }; // Handle file to base64 logic if needed
      
      if (data.images_files && data.images_files.length > 0) {
        const promises = Array.from(data.images_files).map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });
        payload.images = await Promise.all(promises);
      }

      delete payload.images_files;

      if (cert) {
        return apiClient.put(`/admin/certificate/${cert.id}`, payload);
      }
      return apiClient.post('/admin/certificate', payload);
    },
    onSuccess: () => {
      toast.success(cert ? 'Updated successfully' : 'Added successfully');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'An error occurred');
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
        <h2 className=" font-bold mb-4">{cert ? 'Edit Certificate' : 'Add Certificate'}</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Company Name</label>
            <input {...register('company_name', { required: 'Required' })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Certificate Name</label>
            <input {...register('certificate_name', { required: 'Required' })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Issue Date</label>
            <input type="date" {...register('date', { required: 'Required' })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Certificate Images</label>
            <input type="file" multiple accept="image/*" {...register('images_files')} className="w-full border p-2 rounded" />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-muted rounded">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

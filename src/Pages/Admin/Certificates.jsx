import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { optimizeImages } from '@/utils/imageOptimizer';

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
  const [progress, setProgress] = useState({ phase: '', current: 0, total: 0, percent: 0, message: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Track existing images for edit mode
  const [existingImages, setExistingImages] = useState(() => {
    if (!cert) return [];
    if (Array.isArray(cert.images_urls) && cert.images_urls.length > 0) {
      // Map both url and relative path if available
      let rawPaths = [];
      try {
        rawPaths = typeof cert.images === 'string' ? JSON.parse(cert.images) : (cert.images || []);
      } catch (e) {
        rawPaths = [];
      }
      return cert.images_urls.map((url, idx) => ({
        url,
        path: rawPaths[idx] || url
      }));
    }
    return [];
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: cert ? {
      company_name: cert.company_name,
      certificate_name: cert.certificate_name,
      date: new Date(cert.date).toISOString().split('T')[0],
    } : {}
  });

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const isBusy = progress.phase !== '';

  const onSubmit = async (formData) => {
    try {
      // Validate that at least one image will exist
      const totalImagesCount = existingImages.length + selectedFiles.length;
      if (totalImagesCount === 0) {
        toast.error('Please select at least one certificate image');
        return;
      }

      let newUploadedPaths = [];

      // 1. Optimize & Upload new images if any are selected
      if (selectedFiles.length > 0) {
        // Step 1A: Optimize images in browser (resize large camera photos)
        setProgress({
          phase: 'optimizing',
          percent: 5,
          message: `Optimizing ${selectedFiles.length} images...`
        });

        const optimizedFiles = await optimizeImages(selectedFiles, (current, total) => {
          setProgress({
            phase: 'optimizing',
            percent: Math.round((current / total) * 30),
            message: `Optimizing image ${current} of ${total}...`
          });
        });

        // Step 1B: Upload in small batches (6 files per batch)
        const BATCH_SIZE = 6;
        const totalBatches = Math.ceil(optimizedFiles.length / BATCH_SIZE);

        for (let i = 0; i < optimizedFiles.length; i += BATCH_SIZE) {
          const batch = optimizedFiles.slice(i, i + BATCH_SIZE);
          const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
          const startPercent = 30 + Math.round((i / optimizedFiles.length) * 60);

          setProgress({
            phase: 'uploading',
            percent: startPercent,
            message: `Uploading batch ${batchIndex} of ${totalBatches} (${batch.length} images)...`
          });

          const batchFormData = new FormData();
          batch.forEach((f) => batchFormData.append('images', f));

          const uploadRes = await apiClient.post('/admin/certificate/upload-images', batchFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const paths = uploadRes.data?.data?.paths || [];
          newUploadedPaths.push(...paths);
        }
      }

      // Step 2: Combine kept existing images with newly uploaded paths
      const keptPaths = existingImages.map(img => img.path);
      const allFinalImages = [...keptPaths, ...newUploadedPaths];

      // Step 3: Finalize Certificate (Instant lightweight JSON call)
      setProgress({
        phase: 'saving',
        percent: 95,
        message: 'Saving certificate details...'
      });

      const payload = {
        company_name: formData.company_name,
        certificate_name: formData.certificate_name,
        date: formData.date,
        images: allFinalImages
      };

      if (cert) {
        await apiClient.put(`/admin/certificate/${cert.id}`, payload);
        toast.success('Certificate updated successfully');
      } else {
        await apiClient.post('/admin/certificate', payload);
        toast.success('Certificate created successfully');
      }

      setProgress({ phase: 'done', percent: 100, message: 'Done!' });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      onClose();
    } catch (err) {
      console.error('Upload/Save error:', err);
      toast.error(err.response?.data?.message || err.message || 'An error occurred during save');
      setProgress({ phase: '', current: 0, total: 0, percent: 0, message: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-lg border border-border shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {cert ? 'Edit Certificate' : 'Add Certificate'}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isBusy}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Company Name</label>
            <input 
              {...register('company_name', { required: 'Company name is required' })} 
              disabled={isBusy}
              placeholder="e.g. Acme Corp"
              className="w-full border border-border bg-background p-2.5 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" 
            />
            {errors.company_name && <p className="text-xs text-destructive mt-1">{errors.company_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Certificate Name</label>
            <input 
              {...register('certificate_name', { required: 'Certificate name is required' })} 
              disabled={isBusy}
              placeholder="e.g. ISO 9001:2015"
              className="w-full border border-border bg-background p-2.5 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" 
            />
            {errors.certificate_name && <p className="text-xs text-destructive mt-1">{errors.certificate_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Issue Date</label>
            <input 
              type="date" 
              {...register('date', { required: 'Issue date is required' })} 
              disabled={isBusy}
              className="w-full border border-border bg-background p-2.5 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" 
            />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
          </div>

          {/* Existing Images (Edit mode) */}
          {cert && existingImages.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Current Images ({existingImages.length})
                </label>
                <span className="text-xs text-muted-foreground">Click x to remove</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 border border-border rounded-lg bg-muted/30">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-md overflow-hidden border border-border aspect-square bg-muted">
                    <img src={img.url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                    {!isBusy && (
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Selection */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-foreground">
                {cert ? 'Add New Images (optional)' : 'Certificate Images'}
              </label>
              {selectedFiles.length > 0 && (
                <span className="text-xs font-semibold text-primary">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={isBusy}
              className="w-full text-sm border border-border file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer bg-background p-1.5 rounded-lg" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports selecting 50+ images at once. Images are automatically compressed and uploaded in batches.
            </p>
          </div>

          {/* Progress Bar & Status */}
          {isBusy && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  {progress.message}
                </span>
                <span>{progress.percent}%</span>
              </div>
              <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t border-border mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isBusy}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isBusy} 
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isBusy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {cert ? 'Save Changes' : 'Create Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

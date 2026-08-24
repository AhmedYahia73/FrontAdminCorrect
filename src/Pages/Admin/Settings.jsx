import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/context/SettingsContext';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();
  const { settings, isLoading } = useSettings();
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      brand_name: settings?.brand_name || '',
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = { brand_name: data.brand_name };
      
      if (data.logo_file && data.logo_file.length > 0) {
        payload.logo = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(data.logo_file[0]);
        });
      }
      return apiClient.put('/admin/settings', payload);
    },
    onSuccess: () => {
      toast.success('Saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage system preferences and project data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold  text-foreground mb-4 pb-sm border-b border-border">Project Information</h3>
            
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium  text-muted-foreground mb-4">Brand Name</label>
                  <input 
                    type="text" 
                    {...register('brand_name', { required: 'Required' })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-base  focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium  text-muted-foreground mb-4">Change Logo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    {...register('logo_file')}
                    className="w-full border border-border rounded-lg px-3 py-2 text-base  focus:border-primary outline-none" 
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium  hover:bg-primary transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {settings?.qr_url && (
                <div className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg border border-border border-dashed">
                  <label className="block text-sm font-medium  text-muted-foreground mb-2 w-full text-center">Project QR Code</label>
                  <div className="bg-white p-2 rounded shadow-sm inline-block">
                    <img src={settings.qr_url} alt="Project QR Code" className="w-48 h-48 object-contain" />
                  </div>
                  <p className="text-sm  text-muted-foreground mt-2 text-center">Scan the code to access company data</p>
                  <a href={settings.qr_url} download className="mt-4 text-primary text-sm font-medium  hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">download</span> Download Image
                  </a>
                </div>
              )}
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}

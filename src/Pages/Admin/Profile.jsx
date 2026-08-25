import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export default function Profile() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/admin/auth/profile');
        const user = res.data?.data?.user;
        if (user) {
          setValue('name', user.name);
          setValue('email', user.email);
          setValue('phone', user.phone);
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      
      const res = await apiClient.put('/admin/auth/profile', payload);
      toast.success(res.data?.message || 'Profile updated successfully');
      
      if (res.data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
      }
      
      setValue('password', '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6">My Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Name</label>
            <input 
              {...register('name', { required: 'Required' })} 
              className="w-full border border-border rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none" 
            />
            {errors.name && <span className="text-destructive text-xs mt-1">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input 
              type="email"
              {...register('email', { required: 'Required' })} 
              className="w-full border border-border rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none" 
            />
            {errors.email && <span className="text-destructive text-xs mt-1">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Phone</label>
            <input 
              {...register('phone', { required: 'Required' })} 
              className="w-full border border-border rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none" 
            />
            {errors.phone && <span className="text-destructive text-xs mt-1">{errors.phone.message}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              New Password (leave blank to keep current)
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                {...register('password')} 
                className="w-full border border-border rounded-lg p-2 pr-10 focus:ring-1 focus:ring-primary outline-none" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-6">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

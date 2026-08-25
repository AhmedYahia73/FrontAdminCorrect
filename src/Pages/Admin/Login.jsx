import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '@/utils/auth';
import { apiClient } from '@/lib/axios';
import { useSettings } from '@/context/SettingsContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { settings, isLoading } = useSettings();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  
  const brandName = settings?.brand_name || 'Correct Solution';
  const logoUrl = settings?.logo_url || 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg';

  const onSubmit = async (data) => {
    
    try {
      const res = await apiClient.post('/admin/auth/login', data);
      if (res.data?.data?.token) {
        setAuthToken(res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        toast.success(res.data.message || 'تم تسجيل الدخول بنجاح');
        navigate('/admin/certificates');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          {!isLoading && (
            <img src={logoUrl} alt={brandName} className="h-24 w-auto object-contain bg-white rounded-xl p-2 shadow-sm border border-border" />
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary text-3xl font-bold">
          Log in to {brandName}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground text-sm">
          Enter your credentials to access the dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-foreground text-sm font-medium">Email Address</label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-base"
                />
                {errors.email && <span className="text-destructive text-sm mt-1 block">{errors.email.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground text-sm font-medium">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: 'Password is required' })}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-base"
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
                {errors.password && <span className="text-destructive text-sm mt-1 block">{errors.password.message}</span>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Loading...' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

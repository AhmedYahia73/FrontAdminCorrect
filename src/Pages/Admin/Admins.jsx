import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export default function Admins() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admins', page, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/admin/admin', {
        params: { page, limit: 10, search: debouncedSearch }
      });
      return res.data?.data || { admins: [], pagination: { totalPages: 1 } };
    },
    keepPreviousData: true,
  });

  const adminsData = Array.isArray(data) ? data : data?.admins || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/admin/admin/${id}`),
    onSuccess: () => {
      toast.success('Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const openAddModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this administrator?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administrators Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage system users and their access.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow"
            />
          </div>
          <button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Admin
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adminsData?.map((admin) => (
                    <tr key={admin.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{admin.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{admin.phone}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(admin)} className="w-8 h-8 flex items-center justify-center rounded border border-primary text-primary hover:bg-primary hover:text-white transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {admin.id !== currentUser.id && (
                            <button onClick={() => handleDelete(admin.id)} className="w-8 h-8 flex items-center justify-center rounded border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {adminsData?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No administrators found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
        <AdminModal
          admin={editingAdmin}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function AdminModal({ admin, onClose }) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: admin ? {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    } : { role: 'admin' }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (admin) {
        return apiClient.put(`/admin/admin/${admin.id}`, data);
      }
      return apiClient.post('/admin/admin', data);
    },
    onSuccess: () => {
      toast.success(admin ? 'Updated successfully' : 'Added successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'An error occurred');
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-foreground">{admin ? 'Edit Administrator' : 'Add Administrator'}</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1 text-foreground">Role</label>
            <select 
              {...register('role', { required: 'Required' })} 
              className="w-full border border-border rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none bg-background"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="leader">Leader</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              {admin ? 'Password (leave blank to keep current)' : 'Password'}
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                {...register('password', { required: !admin ? 'Required' : false })} 
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
            {errors.password && <span className="text-destructive text-xs mt-1">{errors.password.message}</span>}
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


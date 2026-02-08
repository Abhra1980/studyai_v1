import { useState, useEffect, useCallback } from 'react';
import { adminService, isAdminUser, type AdminUser, type AdminUserProgress } from '@/services/adminService';
import { useAuthContext } from '@/contexts';

export default function AdminPage() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [count, setCount] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<AdminUserProgress | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAdminUser(user?.email)) return;
    setLoading(true);
    setError(null);
    try {
      const [countRes, usersRes] = await Promise.all([
        adminService.getUserCount(),
        adminService.listUsers(filterActive),
      ]);
      setCount(countRes);
      setUsers(usersRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [user?.email, filterActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewProgress = async (userId: string) => {
    try {
      const progress = await adminService.getUserProgress(userId);
      setSelectedProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addName.trim() || !addPassword.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await adminService.createUser(addEmail.trim(), addName.trim(), addPassword);
      setAddEmail('');
      setAddName('');
      setAddPassword('');
      setShowAddForm(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Deactivate this user? They will no longer be able to log in.')) return;
    try {
      await adminService.deleteUser(userId);
      await fetchData();
      if (selectedProgress?.user_id === userId) setSelectedProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (!isAdminUser(user?.email)) {
    return null;
  }

  return (
    <div className="max-w-[900px] mx-auto py-9 px-7" style={{ fontFamily: 'var(--sa-sans)' }}>
      <h1 className="text-[26px] font-extrabold mb-2" style={{ color: 'var(--sa-text)' }}>Admin</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--sa-muted)' }}>Manage users and track progress</p>

      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--sa-red-light)', color: '#7F1D1D', border: '1px solid var(--sa-red-border)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--sa-border)] border-t-[var(--sa-blue)]" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="text-[13px] font-semibold mb-1" style={{ color: 'var(--sa-muted)' }}>Total Users Signed Up</div>
              <div className="text-[28px] font-extrabold" style={{ color: 'var(--sa-blue)' }}>{count.total}</div>
            </div>
            <div className="p-5 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="text-[13px] font-semibold mb-1" style={{ color: 'var(--sa-muted)' }}>Active Users</div>
              <div className="text-[28px] font-extrabold" style={{ color: 'var(--sa-green)' }}>{count.active}</div>
            </div>
          </div>

          {/* Add User */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-lg border-none cursor-pointer text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--sa-blue), var(--sa-violet))', color: '#fff' }}
            >
              + Add New User
            </button>
            {showAddForm && (
              <form onSubmit={handleAddUser} className="mt-4 p-5 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--sa-muted)' }}>Email</label>
                    <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--sa-border)' }} placeholder="user@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--sa-muted)' }}>Name</label>
                    <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--sa-border)' }} placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--sa-muted)' }}>Password</label>
                    <input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--sa-border)' }} placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={adding} className="px-4 py-2 rounded-lg border-none cursor-pointer text-sm font-semibold disabled:opacity-50" style={{ background: 'var(--sa-blue)', color: '#fff' }}>{adding ? 'Creating...' : 'Create User'}</button>
                  <button type="button" onClick={() => { setShowAddForm(false); setAddEmail(''); setAddName(''); setAddPassword(''); }} className="px-4 py-2 rounded-lg border cursor-pointer text-sm" style={{ borderColor: 'var(--sa-border)' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* User List */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={filterActive} onChange={(e) => setFilterActive(e.target.checked)} />
              <span style={{ color: 'var(--sa-muted)' }}>Active only</span>
            </label>
            <span className="text-xs" style={{ color: 'var(--sa-muted)' }}>Showing {users.length} user{users.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="rounded-[14px] border overflow-hidden" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
            <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
              <table className="w-full text-left border-collapse">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--sa-surface)' }}>
                  <tr style={{ borderBottom: '1px solid var(--sa-border)' }}>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>User ID</th>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Name</th>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Email</th>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Status</th>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Joined</th>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Updated</th>
                    <th className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--sa-muted)' }}>No users found</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--sa-surface-2)' }}>
                        <td className="px-4 py-3 text-[11px] font-mono break-all" style={{ color: 'var(--sa-muted)', maxWidth: 200 }} title="Click to copy"><button type="button" onClick={() => { navigator.clipboard.writeText(u.id); }} className="text-left hover:underline cursor-pointer">{u.id}</button></td>
                        <td className="px-4 py-3 text-sm break-words" style={{ color: 'var(--sa-text)', minWidth: 100 }}>{u.name}</td>
                        <td className="px-4 py-3 text-sm break-words" style={{ color: 'var(--sa-text)', minWidth: 160 }}>{u.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.is_active ? 'bg-[var(--sa-green-light)]' : 'bg-[var(--sa-red-light)]'}`} style={{ color: u.is_active ? 'var(--sa-green)' : '#7F1D1D' }}>{u.is_active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>{u.updated_at ? new Date(u.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                        <td className="px-4 py-3 flex gap-2 flex-wrap">
                          <button type="button" onClick={() => handleViewProgress(u.id)} className="px-3 py-1 rounded text-xs font-semibold border cursor-pointer whitespace-nowrap" style={{ borderColor: 'var(--sa-blue)', color: 'var(--sa-blue)' }}>Progress</button>
                          {u.is_active && user?.id !== u.id && (
                            <button type="button" onClick={() => handleDeleteUser(u.id)} className="px-3 py-1 rounded text-xs font-semibold border cursor-pointer whitespace-nowrap" style={{ borderColor: '#DC2626', color: '#DC2626' }}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Progress Modal / Panel */}
          {selectedProgress && (
            <div className="mt-8 p-6 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--sa-text)' }}>{selectedProgress.name} – Progress</h2>
                <button type="button" onClick={() => setSelectedProgress(null)} className="px-3 py-1 rounded border cursor-pointer text-xs" style={{ borderColor: 'var(--sa-border)' }}>Close</button>
              </div>
              <div className="mb-2 text-sm" style={{ color: 'var(--sa-muted)' }}>{selectedProgress.email}</div>
              <div className="mb-4 text-xs font-mono" style={{ color: 'var(--sa-light)' }} title="User ID">{selectedProgress.user_id}</div>
              <div className="flex gap-4 mb-6">
                <div>
                  <span className="text-2xl font-bold" style={{ color: 'var(--sa-blue)' }}>{selectedProgress.completed}</span>
                  <span className="text-sm ml-1" style={{ color: 'var(--sa-muted)' }}>/ {selectedProgress.total} topics completed</span>
                </div>
              </div>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--sa-muted)' }}>Completed Topics</div>
              <ul className="space-y-1 max-h-[300px] overflow-y-auto">
                {selectedProgress.completed_topics.length === 0 ? (
                  <li className="text-sm" style={{ color: 'var(--sa-muted)' }}>No topics completed yet</li>
                ) : (
                  selectedProgress.completed_topics.map((t) => (
                    <li key={t.topic_id} className="text-sm py-1" style={{ color: 'var(--sa-text)' }}>
                      <span className="font-medium">{t.title}</span>
                      <span className="mx-1" style={{ color: 'var(--sa-muted)' }}>–</span>
                      <span style={{ color: 'var(--sa-muted)' }}>{t.unit_name}</span>
                      {t.completed_at && <span className="ml-2 text-xs" style={{ color: 'var(--sa-light)' }}>({new Date(t.completed_at).toLocaleDateString()})</span>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

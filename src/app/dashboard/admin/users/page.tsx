'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  User,
  MoreVertical,
  Mail,
  Building2,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/types/dashboard';

const roleOptions: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Rollen' },
  { value: 'user', label: 'Kunde' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Administrator' },
];

const roleColors: Record<UserRole, string> = {
  user: 'bg-blue-100 text-blue-600',
  manager: 'bg-purple-100 text-purple-600',
  admin: 'bg-red-100 text-red-600',
};

const roleLabels: Record<UserRole, string> = {
  user: 'Kunde',
  manager: 'Manager',
  admin: 'Administrator',
};

const roleIcons: Record<UserRole, React.ElementType> = {
  user: User,
  manager: UserCheck,
  admin: Shield,
};

const ITEMS_PER_PAGE = 15;

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      setLoading(true);
      const supabase = createClient();

      try {
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

        // Filter by role
        if (roleFilter !== 'all') {
          query = query.eq('role', roleFilter);
        }

        // Search
        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setUsers(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, roleFilter, searchQuery, page]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Access restriction
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Zugriff verweigert</h3>
        <p className="text-gray-500">
          Nur Administratoren haben Zugriff auf die Nutzerverwaltung.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nutzerverwaltung</h1>
        <p className="text-gray-600">
          Benutzer verwalten und Rollen zuweisen
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Gesamt', value: totalCount, icon: Users, color: 'bg-gray-100 text-gray-600' },
          { label: 'Kunden', value: users.filter(u => u.role === 'user').length, icon: User, color: 'bg-blue-100 text-blue-600' },
          { label: 'Manager', value: users.filter(u => u.role === 'manager').length, icon: UserCheck, color: 'bg-purple-100 text-purple-600' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'bg-red-100 text-red-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Name, E-Mail oder Unternehmen suchen..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | 'all');
              setPage(0);
            }}
            className="pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Unternehmen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Registriert
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || ''}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || 'Kein Name'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.company ? (
                          <div className="flex items-center text-gray-600">
                            <Building2 className="h-4 w-4 mr-1.5 text-gray-400" />
                            {user.company}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            onBlur={() => setEditingUser(null)}
                            autoFocus
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {Object.entries(roleLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingUser(user.id)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]} hover:opacity-80 transition-opacity`}
                          >
                            <RoleIcon className="h-3.5 w-3.5 mr-1" />
                            {roleLabels[user.role]}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          {new Date(user.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Zeige {page * ITEMS_PER_PAGE + 1} - {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} von {totalCount}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Seite {page + 1} von {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Benutzer gefunden</h3>
          <p className="text-gray-500">
            {searchQuery || roleFilter !== 'all'
              ? 'Versuchen Sie andere Suchkriterien'
              : 'Es wurden noch keine Benutzer registriert'}
          </p>
        </motion.div>
      )}
    </div>
  );
}

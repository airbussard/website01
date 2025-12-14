'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Loader2,
  Crown,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CreateOrganizationModal from '@/components/organizations/CreateOrganizationModal';
import type { Organization, OrganizationMemberRole } from '@/types/dashboard';

interface OrganizationWithRole extends Organization {
  user_role: OrganizationMemberRole;
}

const roleLabels: Record<OrganizationMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Mitglied',
};

const roleIcons: Record<OrganizationMemberRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleColors: Record<OrganizationMemberRole, string> = {
  owner: 'bg-amber-100 text-amber-700',
  admin: 'bg-purple-100 text-purple-700',
  member: 'bg-blue-100 text-blue-700',
};

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();

      if (res.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchOrganizations();
  };

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisationen</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihre Firmen und Teams
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Organisation erstellen
        </button>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Organisationen
          </h3>
          <p className="text-gray-500 mb-6">
            Sie sind noch keiner Organisation beigetreten.
            <br />
            Erstellen Sie eine neue Organisation oder lassen Sie sich einladen.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Erste Organisation erstellen
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org, index) => {
            const RoleIcon = roleIcons[org.user_role];
            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/dashboard/organizations/${org.id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{org.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[org.user_role]}`}>
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[org.user_role]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {(org.city || org.postal_code) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{[org.postal_code, org.city].filter(Boolean).join(' ')}</span>
                      </div>
                    )}
                    {org.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{org.email}</span>
                      </div>
                    )}
                    {org.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{org.phone}</span>
                      </div>
                    )}
                    {org.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{org.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{org.member_count || '?'} Mitglieder</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(org.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

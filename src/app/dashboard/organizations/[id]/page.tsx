'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Loader2,
  Crown,
  Shield,
  User,
  UserPlus,
  Trash2,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AddMemberModal from '@/components/organizations/AddMemberModal';
import type { Organization, OrganizationMember, OrganizationMemberRole } from '@/types/dashboard';

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

interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[];
}

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<OrganizationWithMembers | null>(null);
  const [userRole, setUserRole] = useState<OrganizationMemberRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`/api/organizations/${id}`);
      const data = await res.json();

      if (!res.ok) {
        router.push('/dashboard/organizations');
        return;
      }

      setOrganization(data.organization);
      setUserRole(data.user_role);
    } catch (error) {
      console.error('Error fetching organization:', error);
      router.push('/dashboard/organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrganization();
    }
  }, [user, id]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Mitglied wirklich entfernen?')) return;

    setRemovingMemberId(memberId);

    try {
      const res = await fetch(`/api/organizations/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId }),
      });

      if (res.ok) {
        // Wenn User sich selbst entfernt hat
        if (memberId === user?.id) {
          router.push('/dashboard/organizations');
          return;
        }
        fetchOrganization();
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Entfernen');
      }
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrganizationMemberRole) => {
    try {
      const res = await fetch(`/api/organizations/${id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId, role: newRole }),
      });

      if (res.ok) {
        fetchOrganization();
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Aktualisieren');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canChangeRoles = userRole === 'owner';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/organizations"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Zurück zu Organisationen
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              {userRole && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${roleColors[userRole]}`}>
                  {(() => {
                    const RoleIcon = roleIcons[userRole];
                    return <RoleIcon className="h-3.5 w-3.5" />;
                  })()}
                  {roleLabels[userRole]}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canManageMembers && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                Mitglied hinzufuegen
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {(organization.street || organization.city) && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="text-gray-900">
                  {organization.street && <>{organization.street}<br /></>}
                  {organization.postal_code} {organization.city}
                </p>
              </div>
            </div>
          )}
          {organization.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">E-Mail</p>
                <a href={`mailto:${organization.email}`} className="text-primary-600 hover:text-primary-700">
                  {organization.email}
                </a>
              </div>
            </div>
          )}
          {organization.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <a href={`tel:${organization.phone}`} className="text-gray-900">
                  {organization.phone}
                </a>
              </div>
            </div>
          )}
          {organization.website && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {organization.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Mitglieder ({organization.members?.length || 0})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {organization.members?.map((member) => {
            const memberUser = member.user;
            const RoleIcon = roleIcons[member.role];
            const isCurrentUser = memberUser?.id === user?.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {memberUser?.avatar_url ? (
                    <img
                      src={memberUser.avatar_url}
                      alt={memberUser.full_name || ''}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {memberUser?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {memberUser?.full_name || memberUser?.email || 'Unbekannt'}
                      {isCurrentUser && <span className="text-gray-400 ml-1">(Sie)</span>}
                    </p>
                    <p className="text-sm text-gray-500">{memberUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge / Selector */}
                  {canChangeRoles && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(memberUser!.id, e.target.value as OrganizationMemberRole)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${roleColors[member.role]}`}
                    >
                      <option value="member">Mitglied</option>
                      <option value="admin">Admin</option>
                      {userRole === 'owner' && <option value="owner">Owner</option>}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleLabels[member.role]}
                    </span>
                  )}

                  {/* Remove Button */}
                  {(canManageMembers || isCurrentUser) && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(memberUser!.id)}
                      disabled={removingMemberId === memberUser?.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title={isCurrentUser ? 'Organisation verlassen' : 'Mitglied entfernen'}
                    >
                      {removingMemberId === memberUser?.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {(!organization.members || organization.members.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              Keine Mitglieder gefunden
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          organizationId={id}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={() => {
            setShowAddMemberModal(false);
            fetchOrganization();
          }}
        />
      )}
    </div>
  );
}

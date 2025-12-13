'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  PenTool,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import ContractUploadModal from '@/components/contracts/ContractUploadModal';
import ContractSigningDialog from '@/components/contracts/ContractSigningDialog';
import type { Contract, ContractStatus } from '@/types/dashboard';

const statusOptions: { value: ContractStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle Status' },
  { value: 'pending_signature', label: 'Warten auf Unterschrift' },
  { value: 'signed', label: 'Unterschrieben' },
  { value: 'expired', label: 'Abgelaufen' },
  { value: 'cancelled', label: 'Storniert' },
];

const statusColors: Record<ContractStatus, { bg: string; text: string; icon: React.ElementType }> = {
  pending_signature: { bg: 'bg-amber-100', text: 'text-amber-600', icon: Clock },
  signed: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
  expired: { bg: 'bg-red-100', text: 'text-red-600', icon: AlertCircle },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: XCircle },
};

const statusLabels: Record<ContractStatus, string> = {
  pending_signature: 'Warten auf Unterschrift',
  signed: 'Unterschrieben',
  expired: 'Abgelaufen',
  cancelled: 'Storniert',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContractsPage() {
  const { user, isManagerOrAdmin } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [signingContract, setSigningContract] = useState<Contract | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  // Projekte fuer Upload-Modal laden
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isManagerOrAdmin) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('pm_projects')
        .select('id, name')
        .order('name');

      if (data) {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      }
    };

    fetchProjects();
  }, [isManagerOrAdmin]);

  // Vertraege laden
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;

      const supabase = createClient();

      try {
        let query = supabase
          .from('contracts')
          .select(`
            *,
            project:pm_projects(id, name, client_id),
            signer:profiles!contracts_signed_by_fkey(id, email, first_name, last_name),
            creator:profiles!contracts_created_by_fkey(id, email, first_name, last_name)
          `)
          .order('created_at', { ascending: false });

        // Filter by status
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Search
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setContracts(data || []);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user, statusFilter, searchQuery]);

  const handleContractSigned = (signedContract: Contract) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === signedContract.id ? signedContract : c))
    );
    setSigningContract(null);
  };

  const handleUploadSuccess = () => {
    // Neu laden
    setLoading(true);
    window.location.reload();
  };

  // Prüfen ob User ein Vertrag unterschreiben kann
  const canSign = (contract: Contract): boolean => {
    if (contract.status !== 'pending_signature') return false;
    // Client des Projekts oder Manager/Admin
    const isClient = contract.project?.client_id === user?.id;
    return isClient || isManagerOrAdmin;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verträge</h1>
          <p className="text-gray-500 mt-1">
            {contracts.length} Vertrag{contracts.length !== 1 ? 'e' : ''} gefunden
          </p>
        </div>
        {isManagerOrAdmin && projects.length > 0 && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Vertrag hochladen
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Vertrag suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContractStatus | 'all')}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Verträge gefunden
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Versuchen Sie andere Suchkriterien'
              : 'Es wurden noch keine Verträge erstellt'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {contracts.map((contract) => {
            const status = statusColors[contract.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={contract.id}
                variants={itemVariants}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${status.bg}`}>
                      <FileText className={`h-6 w-6 ${status.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Projekt: {contract.project?.name || 'Unbekannt'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="h-3.5 w-3.5 mr-1" />
                          {statusLabels[contract.status]}
                        </span>
                        {/* Date */}
                        <span className="inline-flex items-center text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(contract.created_at).toLocaleDateString('de-DE')}
                        </span>
                        {/* Signed by */}
                        {contract.signed_at && contract.signer && (
                          <span className="text-xs text-gray-500">
                            Unterschrieben von {contract.signer.first_name} {contract.signer.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 sm:flex-shrink-0">
                    {/* View */}
                    <Link
                      href={`/dashboard/contracts/${contract.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Details anzeigen"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>

                    {/* Download Original */}
                    {contract.original_pdf_url && (
                      <a
                        href={contract.original_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Original PDF herunterladen"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    )}

                    {/* Sign Button */}
                    {canSign(contract) && (
                      <button
                        onClick={() => setSigningContract(contract)}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <PenTool className="h-4 w-4 mr-1.5" />
                        Unterschreiben
                      </button>
                    )}

                    {/* Download Signed */}
                    {contract.signed_pdf_url && (
                      <a
                        href={contract.signed_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        title="Signiertes PDF herunterladen"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Signiert
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && selectedProjectId && (
          <ContractUploadModal
            projectId={selectedProjectId}
            onClose={() => setShowUploadModal(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      {/* Signing Dialog */}
      <AnimatePresence>
        {signingContract && (
          <ContractSigningDialog
            contract={signingContract}
            onClose={() => setSigningContract(null)}
            onSigned={handleContractSigned}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  PenTool,
  Trash2,
  Building,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import ContractSigningDialog from '@/components/contracts/ContractSigningDialog';
import type { Contract, ContractStatus } from '@/types/dashboard';

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

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isManagerOrAdmin, isAdmin } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showSigningDialog, setShowSigningDialog] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          project:pm_projects(id, name, client_id),
          signer:profiles!contracts_signed_by_fkey(id, email, first_name, last_name, company),
          creator:profiles!contracts_created_by_fkey(id, email, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
        router.push('/dashboard/contracts');
        return;
      }

      setContract(data);
      setLoading(false);
    };

    fetchContract();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Moechten Sie diesen Vertrag wirklich loeschen?')) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Loeschen');
      }

      router.push('/dashboard/contracts');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Fehler beim Loeschen des Vertrags');
      setDeleting(false);
    }
  };

  const handleContractSigned = (signedContract: Contract) => {
    setContract(signedContract);
    setShowSigningDialog(false);
  };

  const canSign = (): boolean => {
    if (!contract || contract.status !== 'pending_signature') return false;
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

  if (!contract) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vertrag nicht gefunden</p>
      </div>
    );
  }

  const status = statusColors[contract.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/contracts"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Zurueck zu Vertraege
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Info */}
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 p-4 rounded-xl ${status.bg}`}>
              <FileText className={`h-8 w-8 ${status.text}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <Link
                href={`/dashboard/projects/${contract.project_id}`}
                className="text-primary-600 hover:text-primary-700 text-sm mt-1 inline-block"
              >
                Projekt: {contract.project?.name}
              </Link>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                  <StatusIcon className="h-4 w-4 mr-1.5" />
                  {statusLabels[contract.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sign Button */}
            {canSign() && (
              <button
                onClick={() => setShowSigningDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PenTool className="h-5 w-5 mr-2" />
                Jetzt unterschreiben
              </button>
            )}

            {/* Download Original */}
            {contract.original_pdf_url && (
              <a
                href={contract.original_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Original PDF
              </a>
            )}

            {/* Download Signed */}
            {contract.signed_pdf_url && (
              <a
                href={contract.signed_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Signiertes PDF
              </a>
            )}

            {/* Delete */}
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 mr-2" />
                )}
                Loeschen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Contract Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Vertragsdetails</h2>

          {/* Beschreibung */}
          {contract.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Beschreibung</h3>
              <p className="text-gray-900">{contract.description}</p>
            </div>
          )}

          {/* Erstellt */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Erstellt am</p>
              <p className="font-medium text-gray-900">
                {new Date(contract.created_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Erstellt von */}
          {contract.creator && (
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Erstellt von</p>
                <p className="font-medium text-gray-900">
                  {contract.creator.first_name} {contract.creator.last_name}
                </p>
              </div>
            </div>
          )}

          {/* Gueltig bis */}
          {contract.valid_until && (
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Gueltig bis</p>
                <p className="font-medium text-gray-900">
                  {new Date(contract.valid_until).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Signature Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Unterschrift</h2>

          {contract.status === 'signed' && contract.signed_at ? (
            <>
              {/* Unterschrieben am */}
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Unterschrieben am</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.signed_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Unterschrieben von */}
              {contract.signer && (
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Unterschrieben von</p>
                    <p className="font-medium text-gray-900">
                      {contract.signer.first_name} {contract.signer.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{contract.signer.email}</p>
                  </div>
                </div>
              )}

              {/* Firma */}
              {contract.signer?.company && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Firma</p>
                    <p className="font-medium text-gray-900">{contract.signer.company}</p>
                  </div>
                </div>
              )}

              {/* Signatur-Vorschau */}
              {contract.signature_data && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Unterschrift</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={contract.signature_data}
                      alt="Unterschrift"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-amber-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Dieser Vertrag wurde noch nicht unterschrieben.
              </p>
              {canSign() && (
                <button
                  onClick={() => setShowSigningDialog(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PenTool className="h-5 w-5 mr-2" />
                  Jetzt unterschreiben
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview */}
      {contract.original_pdf_url && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dokumentvorschau</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              src={contract.signed_pdf_url || contract.original_pdf_url}
              className="w-full h-[600px]"
              title="Vertragsvorschau"
            />
          </div>
        </div>
      )}

      {/* Signing Dialog */}
      <AnimatePresence>
        {showSigningDialog && contract && (
          <ContractSigningDialog
            contract={contract}
            onClose={() => setShowSigningDialog(false)}
            onSigned={handleContractSigned}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

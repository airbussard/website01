'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertTriangle, CheckCircle, Loader2, Download } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';
import type { Contract } from '@/types/dashboard';

interface ContractSigningDialogProps {
  contract: Contract;
  onClose: () => void;
  onSigned: (contract: Contract) => void;
}

export default function ContractSigningDialog({
  contract,
  onClose,
  onSigned,
}: ContractSigningDialogProps) {
  const [step, setStep] = useState<'preview' | 'sign' | 'processing' | 'success'>('preview');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignature = async (signatureDataUrl: string) => {
    setStep('processing');
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureDataUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Signieren');
      }

      const { contract: signedContract } = await response.json();
      setStep('success');

      setTimeout(() => {
        onSigned(signedContract);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStep('sign');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{contract.title}</h2>
                <p className="text-sm text-gray-500">Vertrag zur Unterschrift</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Step: Preview */}
            {step === 'preview' && (
              <div className="space-y-6">
                {/* PDF Viewer */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {contract.original_pdf_url ? (
                    <iframe
                      src={contract.original_pdf_url}
                      className="w-full h-[400px]"
                      title="Vertragsvorschau"
                    />
                  ) : (
                    <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
                      PDF-Vorschau nicht verfuegbar
                    </div>
                  )}
                </div>

                {/* Download Link */}
                {contract.original_pdf_url && (
                  <a
                    href={contract.original_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF herunterladen
                  </a>
                )}

                {/* Beschreibung */}
                {contract.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{contract.description}</p>
                  </div>
                )}

                {/* Checkbox */}
                <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    Ich habe den Vertrag gelesen und verstanden. Ich akzeptiere die darin enthaltenen Bedingungen.
                  </span>
                </label>

                {/* Warnung */}
                <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Mit Ihrer elektronischen Unterschrift bestaetigen Sie rechtsverbindlich
                    die Annahme dieses Vertrags.
                  </p>
                </div>

                {/* Button */}
                <button
                  onClick={() => setStep('sign')}
                  disabled={!accepted}
                  className="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Weiter zur Unterschrift
                </button>
              </div>
            )}

            {/* Step: Sign */}
            {step === 'sign' && (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <SignatureCanvas
                  onSave={handleSignature}
                  onCancel={() => setStep('preview')}
                  width={600}
                  height={200}
                />
              </div>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <div className="py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Vertrag wird signiert...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Die Unterschrift wird in das PDF eingebettet.
                </p>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Vertrag erfolgreich unterschrieben!
                </h3>
                <p className="text-gray-600">
                  Das signierte Dokument steht ab sofort zum Download bereit.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Key, Trash2, Loader2 } from 'lucide-react';
import type { Profile } from '@/types/dashboard';

interface UserActionsMenuProps {
  user: Profile;
  onEdit: (user: Profile) => void;
  onDelete: () => void;
}

export default function UserActionsMenu({ user, onEdit, onDelete }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside schließt Menü
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
      });

      if (res.ok) {
        alert(`Passwort-Reset-E-Mail wurde an ${user.email} gesendet.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Senden der E-Mail');
      }
    } catch (err) {
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setIsResetting(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onDelete();
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Löschen');
      }
    } catch (err) {
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowDeleteConfirm(false);
        }}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* Bearbeiten */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(user);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            Bearbeiten
          </button>

          {/* Passwort zurücksetzen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetPassword();
            }}
            disabled={isResetting}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Key className="h-4 w-4" />
            )}
            Passwort zurücksetzen
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Löschen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
              showDeleteConfirm
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {showDeleteConfirm ? 'Wirklich löschen?' : 'Löschen'}
          </button>
        </div>
      )}
    </div>
  );
}

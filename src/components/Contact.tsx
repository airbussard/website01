'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Send, Mail, MessageSquare, Building, User, Briefcase } from 'lucide-react';
import { ContactForm } from '@/types';

interface ContactProps {
  showHeading?: boolean;
}

export default function Contact({ showHeading = true }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Spam-Schutz: Zeit-Tracking und JS-Token (nur auf Client, verhindert Hydration Mismatch)
  const [formLoadTime, setFormLoadTime] = useState(0);
  const [jsToken, setJsToken] = useState('');

  useEffect(() => {
    // Nur auf Client ausfuehren
    setFormLoadTime(Date.now());
    const ua = navigator.userAgent || '';
    setJsToken(btoa(`${Date.now()}-${ua.slice(0, 20)}`).slice(0, 16));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          _t: Date.now() - formLoadTime, // Zeit seit Formular-Load
          _token: jsToken, // JS-Token
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Kostenloses Erstgespraech
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Erzaehlen Sie uns von Ihrem Vorhaben - wir melden uns innerhalb von 24 Stunden
            </p>
          </motion.div>
        )}

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name ist erforderlich' })}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Max Mustermann"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    E-Mail *
                  </label>
                  <input
                    {...register('email', {
                      required: 'E-Mail ist erforderlich',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Ungültige E-Mail-Adresse',
                      },
                    })}
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="max@beispiel.de"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-2" />
                    Unternehmen
                  </label>
                  <input
                    {...register('company')}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Firma GmbH (optional)"
                  />
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Projekttyp
                  </label>
                  <select
                    {...register('projectType')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="website">Website</option>
                    <option value="webapp">Web-Applikation</option>
                    <option value="mobile">iOS App</option>
                    <option value="other">Sonstiges</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betreff *
                </label>
                <input
                  {...register('subject', { required: 'Betreff ist erforderlich' })}
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Neue Website für unser Unternehmen"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-2" />
                  Nachricht *
                </label>
                <textarea
                  {...register('message', {
                    required: 'Nachricht ist erforderlich',
                    minLength: {
                      value: 10,
                      message: 'Nachricht muss mindestens 10 Zeichen lang sein',
                    },
                  })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Beschreiben Sie Ihr Projekt..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              {/* Honeypot - besser versteckt fuer Spam-Bots */}
              <div
                style={{ opacity: 0, position: 'absolute', top: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
                aria-hidden="true"
              >
                <label htmlFor="contact-website">Website</label>
                <input
                  {...register('website')}
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  Vielen Dank für Ihre Anfrage! Wir werden uns schnellstmöglich bei Ihnen melden.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                  Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Wird gesendet...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Unverbindlich anfragen</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
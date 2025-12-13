'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, Pen } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

export default function SignatureCanvas({
  onSave,
  onCancel,
  width = 500,
  height = 200,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Canvas initialisieren
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // High-DPI Support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(dpr, dpr);

    // Styling
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Weisser Hintergrund
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);

    setCtx(context);
  }, [width, height]);

  // Maus/Touch Position ermitteln
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Zeichnen starten
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    e.preventDefault();

    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  }, [ctx, getPosition]);

  // Zeichnen
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, ctx, getPosition]);

  // Zeichnen beenden
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Canvas loeschen
  const clearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
  }, [ctx, width, height]);

  // Signatur als PNG exportieren
  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [hasSignature, onSave]);

  return (
    <div className="space-y-4">
      {/* Hinweis */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Pen className="h-4 w-4" />
        <span>Bitte unterschreiben Sie im Feld unten (Maus oder Finger):</span>
      </div>

      {/* Canvas Container */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Aktionen */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Loeschen
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={saveSignature}
            disabled={!hasSignature}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4 mr-2" />
            Unterschrift bestaetigen
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { QRStyle, SocialPlatform } from '../types/qr';
import { generateCleanPNG, generateCleanSVG } from '../utils/export';
import gsap from 'gsap';

interface ExportModalProps {
  content: string;
  style: QRStyle;
  platform?: SocialPlatform;
  onClose: () => void;
}

export function ExportModal({ content, style, platform, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRef.current || !backdropRef.current) return;

    // Backdrop fade in
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    // Modal slide up and scale
    gsap.fromTo(
      modalRef.current,
      { y: 50, scale: 0.9, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }
    );

    // Animate buttons with stagger
    const buttons = modalRef.current.querySelectorAll('button');
    gsap.fromTo(
      Array.from(buttons).slice(0, -1), // All except close button
      { x: -20, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power2.out',
      }
    );
  }, []);

  const handleClose = () => {
    if (!modalRef.current || !backdropRef.current) return;

    gsap.to(modalRef.current, {
      y: 50,
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const getFilename = (ext: string) => {
    if (style.title) {
      return `${style.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${ext}`;
    }
    return `qr-code.${ext}`;
  };

  const animateButton = (button: HTMLButtonElement) => {
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        });
      },
    });
  };

  const downloadPNG = async (e: React.MouseEvent<HTMLButtonElement>) => {
    animateButton(e.currentTarget);
    setExporting(true);
    setError('');
    try {
      const dataUrl = await generateCleanPNG(content, style, 400, platform);
      const link = document.createElement('a');
      link.download = getFilename('png');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG export failed:', err);
      setError('Failed to export PNG. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const downloadSVG = async (e: React.MouseEvent<HTMLButtonElement>) => {
    animateButton(e.currentTarget);
    setExporting(true);
    setError('');
    try {
      const svg = await generateCleanSVG(content, style, platform);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = getFilename('svg');
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG export failed:', err);
      setError('Failed to export SVG. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const downloadPDF = async (e: React.MouseEvent<HTMLButtonElement>) => {
    animateButton(e.currentTarget);
    setExporting(true);
    setError('');
    try {
      const styleWithoutTitle = { ...style, title: undefined };
      const dataUrl = await generateCleanPNG(content, styleWithoutTitle, 400, platform);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const qrSize = 100;
      const x = (pageWidth - qrSize) / 2;
      
      if (style.title) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.setTextColor(26, 26, 26);
        pdf.text(style.title, pageWidth / 2, 50, { align: 'center' });
      }
      
      const qrY = style.title ? 65 : 50;
      pdf.addImage(dataUrl, 'PNG', x, qrY, qrSize, qrSize);
      
      pdf.save(getFilename('pdf'));
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    animateButton(e.currentTarget);
    setError('');
    try {
      const dataUrl = await generateCleanPNG(content, style, 400, platform);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Failed to copy. Please try downloading instead.');
    }
  };

  const hasBackgroundImage = !!style.backgroundImage;

  return (
    <div 
      ref={backdropRef}
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" 
      onClick={handleClose}
    >
      <div 
        ref={modalRef}
        className="brutal-card max-w-md w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="brutal-heading text-xl mb-4">Export QR Code</h2>
        
        {style.title && (
          <p className="text-[#737373] text-sm mb-2">
            Title: <span className="font-medium text-[#1a1a1a]">{style.title}</span>
          </p>
        )}
        
        {(platform && platform !== 'custom') && (
          <p className="text-[#5a8a0a] font-medium mb-2 text-sm">
            Includes {platform} logo
          </p>
        )}
        
        {hasBackgroundImage && (
          <p className="text-[#5a8a0a] font-medium mb-2 text-sm">
            Includes background image (PNG/PDF only)
          </p>
        )}
        
        {error && (
          <p className="text-red-500 font-medium mb-4 text-sm bg-red-50 p-3 rounded-sm">
            {error}
          </p>
        )}
        
        <div className="space-y-3 mt-4">
          <button
            onClick={downloadPNG}
            disabled={exporting}
            className="brutal-button w-full"
          >
            {exporting ? 'Exporting...' : 'Download PNG'}
          </button>
          
          <button
            onClick={downloadSVG}
            disabled={exporting}
            className="brutal-button-secondary w-full"
          >
            Download SVG {hasBackgroundImage && '(no background)'}
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={exporting}
            className="brutal-button-secondary w-full"
          >
            Download PDF
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={exporting}
            className="brutal-button-secondary w-full"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
        
        <button
          onClick={handleClose}
          className="mt-6 w-full py-3 font-semibold uppercase border-2 border-[#1a1a1a] hover:bg-gray-50 transition-colors rounded-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

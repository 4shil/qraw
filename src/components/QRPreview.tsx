import { useEffect, useState, useRef } from 'react';
import { QRStyle, SocialPlatform, SOCIAL_LOGOS } from '../types/qr';
import { generateQRDataUrl } from '../utils/qr';
import gsap from 'gsap';

interface QRPreviewProps {
  content: string;
  style: QRStyle;
  platform?: SocialPlatform;
}

export function QRPreview({ content, style, platform }: QRPreviewProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const qrRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content) {
      setDataUrl('');
      return;
    }

    const generate = async () => {
      setLoading(true);
      setError('');
      try {
        const url = await generateQRDataUrl(content, {
          ...style,
          errorCorrection: platform || style.backgroundImage ? 'H' : style.errorCorrection,
        });
        setDataUrl(url);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [content, style, platform]);

  useEffect(() => {
    if (dataUrl && qrRef.current) {
      // Animate QR code appearance
      gsap.fromTo(
        qrRef.current,
        { scale: 0.8, opacity: 0, rotation: -5 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, [dataUrl]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  if (!content) {
    return (
      <div className="brutal-card flex items-center justify-center aspect-square bg-[#f5f5f5]">
        <p className="text-[#a3a3a3] font-medium text-center px-6">
          Fill in the form to generate your QR code
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="brutal-card flex items-center justify-center aspect-square">
        <div className="animate-pulse">
          <p className="font-medium text-[#737373]">Generating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brutal-card flex items-center justify-center aspect-square bg-red-50">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="brutal-card p-4 relative overflow-hidden">
      {/* Background image preview */}
      {style.backgroundImage && (
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${style.backgroundImage})` }}
        />
      )}
      
      {/* Title preview */}
      {style.title && (
        <div className="relative z-10 text-center mb-3">
          <p 
            className="font-bold text-lg"
            style={{ color: style.foreground }}
          >
            {style.title}
          </p>
        </div>
      )}
      
      {/* QR Code */}
      <div className="relative z-10">
        <img
          ref={qrRef}
          src={dataUrl}
          alt="QR Code"
          className="w-full aspect-square"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Logo overlay for social platforms */}
        {platform && platform !== 'custom' && SOCIAL_LOGOS[platform] && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 border-2"
            style={{ 
              width: '18%', 
              height: '18%',
              borderColor: style.foreground 
            }}
          >
            <div 
              className="w-full h-full"
              style={{ color: style.foreground }}
              dangerouslySetInnerHTML={{ __html: SOCIAL_LOGOS[platform] }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

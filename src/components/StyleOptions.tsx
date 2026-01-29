import { QRStyle } from '../types/qr';
import { checkContrast } from '../utils/qr';
import { useRef } from 'react';

interface StyleOptionsProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
}

export function StyleOptions({ style, onChange }: StyleOptionsProps) {
  const contrastOk = checkContrast(style.foreground, style.background);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (key: 'foreground' | 'background', value: string) => {
    const newStyle = { ...style, [key]: value };
    
    if (!checkContrast(newStyle.foreground, newStyle.background)) {
      if (key === 'foreground') {
        newStyle.background = newStyle.foreground === '#000000' ? '#FFFFFF' : '#000000';
      } else {
        newStyle.foreground = newStyle.background === '#FFFFFF' ? '#000000' : '#FFFFFF';
      }
    }
    
    onChange(newStyle);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({ ...style, backgroundImage: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeBackgroundImage = () => {
    onChange({ ...style, backgroundImage: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="brutal-heading text-base">Customize</h3>
      
      <div>
        <label className="brutal-label">Title (optional)</label>
        <input
          type="text"
          value={style.title || ''}
          onChange={(e) => onChange({ ...style, title: e.target.value })}
          placeholder="e.g. Scan for Wi-Fi"
          className="brutal-input"
          maxLength={50}
        />
        <p className="text-[#a3a3a3] text-xs mt-1">Appears above QR code in exports</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="brutal-label">Foreground</label>
          <input
            type="color"
            value={style.foreground}
            onChange={(e) => handleColorChange('foreground', e.target.value)}
            className="w-full h-10 border-2 border-[#1a1a1a] cursor-pointer rounded-sm"
          />
        </div>
        
        <div>
          <label className="brutal-label">Background</label>
          <input
            type="color"
            value={style.background}
            onChange={(e) => handleColorChange('background', e.target.value)}
            className="w-full h-10 border-2 border-[#1a1a1a] cursor-pointer rounded-sm"
          />
        </div>
      </div>
      
      {!contrastOk && (
        <p className="text-amber-600 font-medium text-sm">
          Low contrast - auto-adjusting for scan reliability
        </p>
      )}
      
      <div>
        <label className="brutal-label">Background Image (optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="bg-image-upload"
        />
        {style.backgroundImage ? (
          <div className="flex items-center gap-3">
            <div 
              className="w-16 h-16 border-2 border-[#1a1a1a] rounded-sm bg-cover bg-center"
              style={{ backgroundImage: `url(${style.backgroundImage})` }}
            />
            <div className="flex-1">
              <p className="text-sm text-[#737373]">Image uploaded</p>
              <button
                type="button"
                onClick={removeBackgroundImage}
                className="text-red-500 text-sm font-medium hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="bg-image-upload"
            className="block w-full p-4 border-2 border-dashed border-[#a3a3a3] text-center cursor-pointer hover:border-[#1a1a1a] transition-colors rounded-sm"
          >
            <span className="text-[#737373]">Click to upload image</span>
          </label>
        )}
        <p className="text-[#a3a3a3] text-xs mt-1">Image appears behind QR code in exports</p>
      </div>
      
      <div>
        <label className="brutal-label">Error Correction</label>
        <select
          value={style.errorCorrection}
          onChange={(e) => onChange({ ...style, errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
          className="brutal-select"
        >
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%) - Best with images</option>
        </select>
      </div>
    </div>
  );
}

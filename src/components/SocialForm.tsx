import { useState } from 'react';
import { SocialPlatform, SOCIAL_PLATFORMS } from '../types/qr';
import { generateSocialUrl, isValidUrl } from '../utils/qr';

interface SocialFormProps {
  onGenerate: (content: string, platform?: SocialPlatform) => void;
}

export function SocialForm({ onGenerate }: SocialFormProps) {
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const currentPlatform = SOCIAL_PLATFORMS[platform];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(platform === 'custom' ? 'URL is required' : 'Username is required');
      return;
    }
    
    if (platform === 'custom' && !isValidUrl(username.trim())) {
      setError('Invalid URL format');
      return;
    }
    
    setError('');
    const url = generateSocialUrl({ platform, username: username.trim() });
    onGenerate(url, platform);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="brutal-label">Platform</label>
        <select
          value={platform}
          onChange={(e) => { setPlatform(e.target.value as SocialPlatform); setUsername(''); setError(''); }}
          className="brutal-select"
        >
          {Object.entries(SOCIAL_PLATFORMS).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="brutal-label">
          {platform === 'custom' ? 'Full URL' : `${currentPlatform.name} Username`}
        </label>
        <div className="relative">
          {platform !== 'custom' && currentPlatform.prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-400">
              {currentPlatform.prefix}
            </span>
          )}
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder={platform === 'custom' ? 'https://example.com' : 'username'}
            className={`brutal-input ${platform !== 'custom' && currentPlatform.prefix ? 'pl-10' : ''} ${error ? 'border-red-400' : ''}`}
          />
        </div>
        {error && <p className="text-red-500 font-medium mt-2 text-sm">{error}</p>}
        {platform !== 'custom' && (
          <p className="text-gray-500 text-sm mt-2">
            {currentPlatform.baseUrl}{username || 'username'}
          </p>
        )}
        {platform !== 'custom' && (
          <p className="text-[#5a8a0a] text-sm mt-1 font-medium">
            Platform logo will be embedded in QR
          </p>
        )}
      </div>
      
      <button type="submit" className="brutal-button w-full">
        Generate QR Code
      </button>
    </form>
  );
}

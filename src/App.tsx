import { useState } from 'react';
import { QRType, QRStyle, DEFAULT_QR_STYLE, SocialPlatform } from './types/qr';
import { generateId } from './utils/qr';
import { addToHistory } from './utils/storage';
import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { URLForm } from './components/URLForm';
import { WifiForm } from './components/WifiForm';
import { SocialForm } from './components/SocialForm';
import { QRPreview } from './components/QRPreview';
import { StyleOptions } from './components/StyleOptions';
import { ExportModal } from './components/ExportModal';
import { History } from './components/History';
import { About } from './components/About';

function App() {
  const [qrType, setQrType] = useState<QRType>('url');
  const [content, setContent] = useState('');
  const [style, setStyle] = useState<QRStyle>(DEFAULT_QR_STYLE);
  const [showExport, setShowExport] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState<SocialPlatform | undefined>();

  const handleGenerate = (newContent: string, platform?: SocialPlatform) => {
    setContent(newContent);
    setCurrentPlatform(platform);
    addToHistory({
      id: generateId(),
      type: qrType,
      content: newContent,
      timestamp: Date.now(),
      platform,
    });
    setHistoryRefresh((prev) => prev + 1);
  };

  const handleHistorySelect = (selectedContent: string) => {
    setContent(selectedContent);
    setCurrentPlatform(undefined);
  };

  const handleTypeChange = (type: QRType) => {
    setQrType(type);
    if (type !== 'social') {
      setCurrentPlatform(undefined);
    }
  };

  const renderForm = () => {
    switch (qrType) {
      case 'url':
        return <URLForm onGenerate={handleGenerate} />;
      case 'wifi':
        return <WifiForm onGenerate={handleGenerate} />;
      case 'social':
        return <SocialForm onGenerate={handleGenerate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="brutal-card">
              <h2 className="brutal-heading text-lg mb-6">Create QR Code</h2>
              <TypeSelector selected={qrType} onChange={handleTypeChange} />
              
              <div className="mt-6">
                {renderForm()}
              </div>
            </div>
            
            <History onSelect={handleHistorySelect} refreshTrigger={historyRefresh} />
          </div>
          
          <div className="space-y-6">
            <QRPreview content={content} style={style} platform={currentPlatform} />
            
            {content && (
              <>
                <div className="brutal-card">
                  <StyleOptions style={style} onChange={setStyle} />
                </div>
                
                <button
                  onClick={() => setShowExport(true)}
                  className="brutal-button w-full text-lg py-4"
                >
                  Export QR Code
                </button>
              </>
            )}
          </div>
        </div>
        
        <About />
      </main>
      
      <footer className="border-t-2 border-[#e5e5e5] py-8 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-bold text-[#1a1a1a]">Qraw</p>
              <p className="text-[#737373] text-sm">
                Open source QR code generator
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <a 
                href="https://github.com/4shil/qrage-web" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#737373] hover:text-[#1a1a1a] transition-colors"
              >
                GitHub
              </a>
              <span className="text-[#737373]">MIT License</span>
            </div>
          </div>
        </div>
      </footer>
      
      {showExport && (
        <ExportModal
          content={content}
          style={style}
          platform={currentPlatform}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

export default App;

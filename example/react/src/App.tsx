import React, { useEffect, useState } from 'react';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';
import ToDesignApp from './components/export/ToDesignApp';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Button } from './components/ui/button';
import HtmlPreview from './components/preview/html';
import './styles/tailwind.css';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState('preview');

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch('/example/google.html');
        if (response.ok) {
          setInput(await response.text());
        } else {
          console.error('Failed to fetch google.html:', response.statusText);
          setInput('<p>Error loading content</p>');
        }
      } catch (error) {
        console.error('Error fetching google.html:', error);
        setInput('<p>Error loading content</p>');
      }
    };

    fetchHtmlContent();
  }, []);

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="header">
          <Button
            variant="ghost"
            asChild
            className="header-button"
          >
            <a
              href="https://github.com/refore-ai/copy-to-design-sdk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="header-logo-container">
                <img src="/logo/demoway/refore.svg" className="header-logo" alt="Refore Logo" />
                <span className="header-title">Refore Copy to Design SDK</span>
              </div>
            </a>
          </Button>
          
          <div className="export-button-container">
            <ToDesignApp 
              apps={[PlatformType.Figma, PlatformType.MasterGo]} 
              content={input} 
            />
          </div>
          
          <Tabs value={viewMode} onValueChange={setViewMode} className="tabs-container">
            <TabsList>
              <TabsTrigger value="preview">preview</TabsTrigger>
              <TabsTrigger value="code">code</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="content-area">
          {viewMode === 'code' && (
            <div className="code-view">
              <Textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                className="code-textarea" 
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="preview-view">
              <HtmlPreview code={input} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
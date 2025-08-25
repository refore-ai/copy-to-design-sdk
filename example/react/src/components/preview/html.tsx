import React from 'react';

interface HtmlPreviewProps {
  code: string;
}

const HtmlPreview: React.FC<HtmlPreviewProps> = ({ code }) => {
  return (
    <iframe 
      srcDoc={code} 
      className="preview-iframe"
      title="HTML Preview"
    />
  );
};

export default HtmlPreview;
import React, { useState, useEffect } from 'react';

const GoogleFrame = () => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch('/google.html')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load HTML');
        return response.text();
      })
      .then((data) => setHtmlContent(data))
      .catch((error) => console.error('Error loading HTML:', error));
  }, []);

  return (
    <div className="w-full h-screen">
      {htmlContent ? (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default GoogleFrame;
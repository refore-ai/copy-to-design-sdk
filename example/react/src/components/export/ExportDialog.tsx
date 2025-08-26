import React, { useEffect, useRef, useState } from 'react';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { DESIGN_APPS } from './type';
import type { ButtonOption, ExportContent } from './type';

// Define component props interface
interface ExportDialogProps {
  open: boolean;                     // Control whether the dialog is open
  onOpenChange: (open: boolean) => void; // Callback for dialog open state change
  selectedOption: ButtonOption;      // Currently selected platform option
  exportContent: ExportContent;      // Content to export
  onClose: () => void;               // Callback for dialog close
}

/**
 * ExportDialog component
 * Main functionality: Displays a dialog for the export process, results, and related instructions
 * Includes video demo, loading state, success/failure feedback, etc.
 */
const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  selectedOption,
  exportContent,
  onClose,
}) => {
  // Get API key from environment variables (required)
  const API_KEY = import.meta.env.VITE_COPY_TO_DESIGN_KEY;
  // Get API endpoint from environment variables (optional)
  const API_ENDPOINT = import.meta.env.VITE_COPY_TO_DESIGN_ENDPOINT
    ? () => import.meta.env.VITE_COPY_TO_DESIGN_ENDPOINT
    : undefined;

  // State management: Whether exporting is in progress
  const [isExporting, setIsExporting] = useState(false);
  // State management: Export result (success, failure, or empty)
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null);
  // State management: Whether the video is loading
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  // Reference: DOM reference to the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get the demo video URL based on the selected platform
  const videoSource = DESIGN_APPS[selectedOption.id as keyof typeof DESIGN_APPS]?.video || '/video/test.mp4';

  /**
   * Handler for closing the dialog
   */
  const closeDialog = () => {
    onOpenChange(false);  // Notify parent component to close the dialog
    onClose();            // Call the provided close callback
    setExportResult(null); // Reset export result state
  };

  /**
   * Core export function
   * Responsible for calling the SDK to copy HTML content to the clipboard
   */
  const handleExport = async () => {
    // Pre-check: Ensure there is content to export
    if (!exportContent) {
      setExportResult('error'); // Set error state
      return;
    }

    // Set loading state: Start export process
    setIsExporting(true);
    setExportResult(null); // Clear previous results

    try {
      // Dynamically import SDK to reduce initial bundle size
      const { CopyToDesign } = await import('@refore-ai/copy-to-design-sdk');

      // Initialize SDK instance
      const copyToDesign = new CopyToDesign({
        key: API_KEY,          // API key
        _endpoint: API_ENDPOINT, // Custom endpoint (optional)
      });

      // Call SDK method to perform copy operation
      await copyToDesign.copyToClipboardFromHTML([exportContent.html], {
        width: exportContent.width || 1920,   // Content width
        height: exportContent.height || 1080, // Content height
        platform: selectedOption.id as PlatformType, // Target platform
      });

      // Export successful, update state
      setExportResult('success');
    } catch (error) {
      // Export failed, log error and update state
      console.error('Export failed:', error);
      setExportResult('error');
    } finally {
      // End export process regardless of success or failure
      setIsExporting(false);
    }
  };

  /**
   * Handler for video load completion
   */
  const handleVideoLoad = () => {
    setIsVideoLoading(false); // Video loaded, hide loading indicator
  };

  /**
   * Effect hook: Automatically start export when dialog opens with content
   */
  useEffect(() => {
    if (open && exportContent) {
      // Reset video loading state
      setIsVideoLoading(true);
      // Automatically start export process
      handleExport();
    }
  }, [open, exportContent]); // Dependencies: Dialog state and export content

  /**
   * Handler for retrying export
   */
  const tryAgain = () => {
    handleExport(); // Re-execute export process
  };

  /**
   * Handler for opening the design tool plugin page
   */
  const openPluginPage = () => {
    // Get the plugin page URL for the platform
    const platform = selectedOption.id as keyof typeof DESIGN_APPS;
    if (DESIGN_APPS[platform]?.plugin) {
      // Open plugin page in a new tab
      window.open(DESIGN_APPS[platform].plugin, '_blank');
    }
  };

  // Render dialog content
  return (
    // Dialog root component
    <Dialog open={open} onOpenChange={closeDialog}>
      {/* Dialog content container */}
      <DialogContent className="max-h-[90vh] min-w-[600px] overflow-hidden p-0 transition-all duration-200">
        {/* Video demo area */}
        <div className="video-container">
          {/* Demo video */}
          <video 
            ref={videoRef} 
            className="video-element"
            controls    // Show video controls
            autoPlay    // Auto-play
            loop        // Loop playback
            onLoadedData={handleVideoLoad}  // Video data loaded event
            onLoadStart={() => setIsVideoLoading(true)} // Loading start event
          >
            {/* Video source */}
            <source src={videoSource} type="video/mp4" />
            {/* Fallback text when video is not supported */}
            Your browser does not support video playback
          </video>

          {/* Mask and loading indicator shown during video loading */}
          {isVideoLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          {/* Mask and loading indicator shown during export */}
          {isExporting && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>

        {/* Result feedback area */}
        <div className="flex h-[220px] items-center justify-center">
          <div className="p-4 text-center">
            {/* Export success state */}
            {exportResult === 'success' && (
              <div>
                {/* Success message */}
                <div className="text-2xl font-bold text-green-600 mb-4">Copying successful</div>
                {/* Operation guide */}
                <div className="mt-3 text-lg font-medium">
                  {selectedOption.id === 'figma'
                    ? 'Open Copy to Figma plugin in Figma canvas, press Command + V \n to paste the content to canvas'
                    : 'Open Copy to Design plugin in design canvas, press Command + V \n to paste the content to canvas'}
                </div>
                {/* Plugin open button */}
                <div className="mt-2">
                  <Button 
                    className="bg-gray-900 px-6 py-2 text-white hover:bg-gray-800" 
                    onClick={openPluginPage}
                  >
                    {selectedOption.id === 'figma' 
                      ? 'Copy to Figma plugin' 
                      : 'Copy to Design plugin'}
                  </Button>
                </div>
                {/* Additional notes */}
                <div className="mt-2 text-[14px]">
                  {`You can directly search for and open the ${
                    selectedOption.id === 'figma' ? 'Copy to Figma' : 'Copy to Design'
                  } plugin within the Figma canvas.`}
                </div>
              </div>
            )}

            {/* Export failure state */}
            {exportResult === 'error' && (
              <div className="h-[40px] text-lg font-medium text-red-700">
                Export failed
              </div>
            )}

            {/* Export in progress state */}
            {isExporting && (
              <div className="h-[40px] text-lg font-medium">
                Copying to {selectedOption.title}...
              </div>
            )}

            {/* Retry button area */}
            <div className="mt-2">
              {exportResult === 'error' && (
                <Button
                  className="bg-gray-900 px-6 py-2 text-white hover:bg-gray-800"
                  onClick={tryAgain}
                >
                  Try again
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
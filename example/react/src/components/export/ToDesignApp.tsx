import React, { useState } from 'react';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';
import ExportDialog from './ExportDialog';
import { DESIGN_APPS } from './type';
import type { ButtonOption, ExportContent } from './type';

// Define component props interface
interface ToDesignAppProps {
  apps?: PlatformType[]; // List of supported design platforms, default is [Figma]
  content?: string;      // HTML content to export
  width?: number;        // Content width, default is 1920px
  height?: number;       // Content height, default is 1080px
}

/**
 * ToDesignApp component
 * Main functionality: Provides the ability to export HTML content to design tools (e.g., Figma, MasterGo)
 * Includes platform selection buttons and export dialog
 */
const ToDesignApp: React.FC<ToDesignAppProps> = ({
  apps = [PlatformType.Figma], // Default only supports Figma
  content = '',                // Default empty content
  width = 1920,                // Default width 1920px
  height = 1080,               // Default height 1080px
}) => {
  // State management: Control whether the export dialog is open
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // State management: Store the currently selected platform option
  const [selectedOption, setSelectedOption] = useState<ButtonOption>({ 
    id: '', 
    title: '', 
    icon: '' 
  });

  /**
   * Handle platform selection event
   * @param option - The platform option selected by the user
   */
  const handleSelect = (option: ButtonOption) => {
    // Update the selected platform option
    setSelectedOption(option);
    // Open the export dialog
    setIsDialogOpen(true);
  };

  /**
   * Handler for closing the dialog
   */
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // Prepare the export content object
  const exportContent: ExportContent = {
    html: content,      // HTML content
    width,              // Width
    height,             // Height
  };

  return (
    // Main container: Contains platform buttons and export dialog
    <div className="bg-background text-foreground rounded-lg border shadow">
      {/* Platform buttons container */}
      <div className="flex space-x-2 p-2">
        {/* Iterate through supported platforms and create a button for each */}
        {apps.map((app) => (
          <button
            key={app}                    // React key prop
            className="export-button"    // Use predefined CSS class
            onClick={() =>
              // Handle selection event when the button is clicked
              handleSelect({
                id: app,                                    // Platform ID
                title: `Copy to ${DESIGN_APPS[app].title}`, // Button display text
                icon: DESIGN_APPS[app].icon,                // Platform icon
              })
            }
          >
            {/* Platform icon */}
            <img src={DESIGN_APPS[app].icon} alt={DESIGN_APPS[app].title} className="export-button-icon" />
            {/* Platform name */}
            <span>{DESIGN_APPS[app].title}</span>
          </button>
        ))}
      </div>
      {/* Export dialog component */}
      <ExportDialog
        open={isDialogOpen}              // Control dialog open state
        onOpenChange={setIsDialogOpen}   // Dialog state change callback
        selectedOption={selectedOption}  // Currently selected platform option
        exportContent={exportContent}    // Content to export
        onClose={closeDialog}            // Dialog close callback
      />
    </div>
  );
};

export default ToDesignApp;
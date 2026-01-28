import { useContext } from 'react';
import { CustomizationContext } from '../contexts/Customization';
export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (context === undefined) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
}
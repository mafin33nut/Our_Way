import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';
import { useCustomization } from '../../hooks/useCustomization';

interface PanelHelpProps {
  children: ReactNode;
  className?: string;
}

export function PanelHelp({ children, className = '' }: PanelHelpProps) {
  const [open, setOpen] = useState(false);
  const { settings } = useCustomization();

  if (!settings.showHelp) {
    return null;
  }

  return (
    <div className={`mt-4 ${className}`}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full max-w-[520px] min-w-[520px] mx-auto flex items-center justify-center gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Как это работает
      </Button>
      {open && <div className="panel-guide mt-3">{children}</div>}
    </div>
  );
}

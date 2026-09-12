import React from 'react';
import { getSeverityColor } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
  showIcon?: boolean;
}

export function SeverityBadge({ severity, className = '', showIcon = true }: SeverityBadgeProps) {
  const colors = getSeverityColor(severity);
  const s = severity?.toLowerCase();

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (s) {
      case 'low':
      case 'mild':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'moderate':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'severe':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'critical':
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${colors.badge} ${colors.border} ${className}`}
    >
      {renderIcon()}
      <span>{severity || 'Unknown'}</span>
    </span>
  );
}

// ============================================================================
// ModuleIcon — ModuleType → lucide-react icon 映射
// ============================================================================

import {
  Activity,
  BarChart3,
  Clock,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import React from 'react';

import type { ModuleType } from '../types';

const ICON_MAP: Record<ModuleType, LucideIcon> = {
  spotSize: BarChart3,
  dv01: Activity,
  modifiedDuration: Clock,
  ytm: TrendingUp,
};

interface ModuleIconProps {
  moduleType: ModuleType;
  size?: number;
  className?: string;
}

const ModuleIcon: React.FC<ModuleIconProps> = ({
  moduleType,
  size = 16,
  className,
}) => {
  const Icon = ICON_MAP[moduleType];
  return <Icon size={size} className={className} />;
};

export default ModuleIcon;

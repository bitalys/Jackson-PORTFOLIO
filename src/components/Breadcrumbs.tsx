import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { AppRoute, navigateTo } from '../utils/router';

export interface BreadcrumbItem {
  label: string;
  route?: AppRoute;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400 py-3 overflow-x-auto scrollbar-none">
      <button
        onClick={() => navigateTo({ page: 'home' })}
        className="cursor-pointer flex items-center gap-1 text-neutral-400 hover:text-white transition-colors shrink-0"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
          {item.route && !item.active ? (
            <button
              onClick={() => navigateTo(item.route!)}
              className="cursor-pointer text-neutral-400 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              {item.label}
            </button>
          ) : (
            <span className={`whitespace-nowrap shrink-0 font-medium ${item.active ? 'text-white' : 'text-neutral-400'}`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

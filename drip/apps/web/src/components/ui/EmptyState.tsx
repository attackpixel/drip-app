import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="text-gray-300">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="max-w-xs text-sm text-gray-500">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

import React from "react";
import { FolderOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title = "لا توجد نتائج أو قضايا مطابقة",
  description = "لم نجد أي سجلات تطابق معايير البحث أو التصفية الحالية.",
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="w-full p-12 text-center rounded-card bg-surface-container-lowest border border-outline-variant flex flex-col items-center justify-center my-6">
      <div className="w-16 h-16 rounded-card bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 opacity-75" />
      </div>
      <h3 className="text-title-md text-primary mb-1">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center gap-2 text-label-md shadow-level-1"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

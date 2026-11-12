import React from 'react';
import { Utensils } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Utensils, 
  title = 'No items found', 
  message = 'Try adjusting your filters or search keywords.',
  actionText,
  onAction
}) {
  return (
    <div className="py-20 px-6 max-w-md mx-auto text-center rounded-3xl bg-lavender-50 border border-gold/30 shadow-soft space-y-4">
      <div className="w-14 h-14 rounded-full bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal mx-auto">
        <Icon className="w-7 h-7 text-plum-royal" />
      </div>
      <h3 className="font-serif font-bold text-xl text-plum-royal">{title}</h3>
      <p className="text-sm text-body-muted font-light leading-relaxed">{message}</p>
      {actionText && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-plum-royal text-ivory hover:bg-plum-dark transition-colors shadow-sm"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}

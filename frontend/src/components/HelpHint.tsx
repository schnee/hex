import React from 'react';

interface HelpHintProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

const TOUCH_MEDIA_QUERY = '(hover: none), (pointer: coarse)';

export const HelpHint: React.FC<HelpHintProps> = ({
  children,
  className,
  label = 'Show help text',
}) => {
  const [isTouchMode, setIsTouchMode] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const tooltipId = React.useId();

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(TOUCH_MEDIA_QUERY);
    const syncTouchMode = () => {
      setIsTouchMode(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsOpen(false);
      }
    };

    syncTouchMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncTouchMode);
      return () => mediaQuery.removeEventListener('change', syncTouchMode);
    }

    mediaQuery.addListener(syncTouchMode);
    return () => mediaQuery.removeListener(syncTouchMode);
  }, []);

  React.useEffect(() => {
    if (!isTouchMode || !isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isTouchMode]);

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isTouchMode) {
      setIsOpen(open => !open);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    if (!isTouchMode) {
      return;
    }

    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <span
      className={`help-hint ${className ?? ''}`.trim()}
      ref={containerRef}
      data-open={isOpen ? 'true' : 'false'}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="help-hint-trigger"
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={isTouchMode ? isOpen : undefined}
        aria-controls={isTouchMode ? tooltipId : undefined}
        onClick={handleTriggerClick}
      >
        ?
      </button>
      <span id={tooltipId} role="tooltip" className="help-hint-tooltip">
        {children}
      </span>
    </span>
  );
};

import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle clicks outside of a specified element and ESC key press
 * @param isOpen - Whether the element is currently open/visible
 * @param onClose - Callback to execute when clicking outside or pressing ESC
 * @returns ref - Ref to attach to the element you want to detect outside clicks for
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return ref;
}
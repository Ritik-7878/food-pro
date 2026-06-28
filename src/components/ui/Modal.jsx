"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Accessible Modal overlay dialog component.
 * 
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is currently visible.
 * @param {function} props.onClose - Callback triggered to request closing the modal.
 * @param {string} [props.title] - Header title text.
 * @param {React.ReactNode} props.children - Modal content elements.
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep onClose callback reference up to date
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
      
      // Focus trapping
      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Save last active element to restore later
    const previousActiveElement = document.activeElement;
    
    // Set initial focus inside modal
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        modalRef.current.focus();
      }
    }

    // Lock page scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-background/60 dark:bg-background/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div
        ref={modalRef}
        tabIndex="-1"
        className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-6 overflow-hidden animate-fade-in-up z-10 focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content Body */}
        <div className="text-sm text-foreground/80 leading-relaxed mb-1">
          {children}
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Textarea } from '@evoapi/design-system/textarea';

interface ResizableTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  widgetColor?: string;
  maxRows?: number;
  minRows?: number;
  disabled?: boolean;
}

export interface ResizableTextareaRef {
  focus: () => void;
  blur: () => void;
  setSelectionRange: (start: number, end: number) => void;
  selectionStart: number | null;
  selectionEnd: number | null;
}

export const ResizableTextarea = forwardRef<ResizableTextareaRef, ResizableTextareaProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder = '',
      className = '',
      maxRows = 4,
      minRows = 1,
      disabled = false,
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      setSelectionRange: (start: number, end: number) =>
        textareaRef.current?.setSelectionRange(start, end),
      get selectionStart() {
        return textareaRef.current?.selectionStart ?? null;
      },
      get selectionEnd() {
        return textareaRef.current?.selectionEnd ?? null;
      },
    }));

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to calculate scroll height
      textarea.style.height = 'auto';

      // Calculate line height (assuming each line is about 22px for better spacing)
      const lineHeight = 22;
      const minHeight = Math.max(minRows * lineHeight, 44); // Minimum 44px height
      const maxHeight = maxRows * lineHeight;

      // Set height based on scroll height, within min/max bounds
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }, [minRows, maxRows]);

    useEffect(() => {
      adjustHeight();
    }, [value, minRows, maxRows, adjustHeight]);

    // Ensure proper initial height on mount
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const initialHeight = Math.max(minRows * 22, 44);
        textarea.style.height = `${initialHeight}px`;
      }
    }, [minRows]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      // Adjust height after state update
      setTimeout(adjustHeight, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Enter behavior (allow Shift+Enter for new line, Enter for send)
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          resize-none
          border
          rounded-md
          px-3 py-2
          text-sm
          text-slate-900
          placeholder:text-slate-400
          focus:outline-none
          focus:ring-2
          focus:border-transparent
          transition-all
          duration-200
          overflow-y-auto
          ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white border-slate-200'}
          ${className}
        `}
        rows={minRows}
        style={{
          minHeight: `40px`,
          maxHeight: `${maxRows * 22}px`,
        }}
      />
    );
  },
);

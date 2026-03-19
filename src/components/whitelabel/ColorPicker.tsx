import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@evoapi/design-system';
import { Input, Label } from '@evoapi/design-system';
import { hexToOklch, isHexColor, isOklchColor, getHexForColorInput } from '@/utils/colorUtils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  useHex?: boolean; // If true, store as hex; if false, store as OKLCH
}

export default function ColorPicker({
  value,
  onChange,
  label,
  placeholder,
  useHex = false,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexValue, setHexValue] = useState('#000000');
  const [inputValue, setInputValue] = useState(value);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Update hex value when value prop changes
  useEffect(() => {
    const hex = getHexForColorInput(value);
    setHexValue(hex);
    setInputValue(value);
  }, [value]);

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexValue(newHex);

    if (useHex) {
      onChange(newHex);
      setInputValue(newHex);
    } else {
      // Convert hex to OKLCH
      const oklch = hexToOklch(newHex);
      onChange(oklch);
      setInputValue(oklch);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If user types hex, convert to OKLCH if needed
    if (isHexColor(newValue)) {
      if (useHex) {
        onChange(newValue);
      } else {
        onChange(hexToOklch(newValue));
      }
    } else if (isOklchColor(newValue) || newValue.startsWith('oklch')) {
      // If OKLCH, use as-is
      onChange(newValue);
    } else {
      // Try to use as-is (might be CSS color name)
      onChange(newValue);
    }
  };

  // Auto-open color picker when popover opens
  useEffect(() => {
    if (open && colorInputRef.current) {
      // Small delay to ensure popover is rendered
      setTimeout(() => {
        colorInputRef.current?.click();
      }, 100);
    }
  }, [open]);

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-3">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || (useHex ? '#00d4aa' : '#00d4aa')}
          className="flex-1 font-mono"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-12 h-12 rounded border-2 border-border hover:border-primary transition-colors cursor-pointer flex-shrink-0"
              style={{ backgroundColor: value || '#000000' }}
              title="Clique para abrir o seletor de cor"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="space-y-3">
              <Label>Seletor de Cor</Label>
              <Input
                ref={colorInputRef}
                type="color"
                value={hexValue}
                onChange={handleColorInputChange}
                className="w-full h-12 cursor-pointer"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Hex: {hexValue}</div>
                {!useHex && (
                  <div className="font-mono text-[10px] break-all">{value}</div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}


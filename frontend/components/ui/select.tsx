'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextType {
  value: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

export function Select({
  children,
  value,
  onValueChange
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, open, setOpen }}>
      <div ref={selectRef} className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === SelectTrigger) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return React.cloneElement(child as React.ReactElement<any>, {
                onClick: () => setOpen(!open),
                isOpen: open
              });
            }
            if (child.type === SelectContent) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen: open,
                onValueChange: (val: string) => {
                  onValueChange(val);
                  setOpen(false);
                }
              });
            }
          }
          return child;
        })}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  onClick,
  isOpen,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isOpen?: boolean;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-500 bg-white hover:bg-gray-50 cursor-pointer ${className}`}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ml-2 text-gray-900 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectContent({
  children,
  isOpen,
  onValueChange
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  onValueChange?: (value: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect: onValueChange
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectValue({ placeholder = 'Select...' }: { placeholder?: string }) {
  const context = React.useContext(SelectContext);
  
  if (!context) {
    return <span className="text-gray-500">{placeholder}</span>;
  }
  
  const displayValue = context.value
    ? context.value.charAt(0).toUpperCase() + context.value.slice(1)
    : placeholder;
  
  return <span className="font-semibold text-gray-900">{displayValue}</span>;
}

export function SelectItem({
  value,
  children,
  onSelect
}: {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left px-3 py-2 hover:bg-green-50 transition text-gray-900 cursor-pointer"
    >
      {children}
    </button>
  );
}

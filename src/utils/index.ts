import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]) {
  try {
    const classes = clsx(...inputs);
    if (typeof classes !== 'string') return '';
    return twMerge(classes);
  } catch (e) {
    console.error('Error in cn function:', e);
    return '';
  }
}


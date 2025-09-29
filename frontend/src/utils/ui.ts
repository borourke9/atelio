export function confidenceLabel(confidence: number): { label: string; className: string } {
  if (confidence >= 0.90) {
    return { label: 'High', className: 'bg-green-100 text-green-700' };
  } else if (confidence >= 0.75) {
    return { label: 'Medium', className: 'bg-amber-100 text-amber-700' };
  } else {
    return { label: 'Low', className: 'bg-red-100 text-red-700' };
  }
}

export function classNames(...args: (string | undefined | null | false)[]): string {
  return args.filter(Boolean).join(' ');
}

export function formatDim(dim?: string): string {
  return dim || 'Unknown';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

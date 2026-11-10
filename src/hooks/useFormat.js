import { useAuth } from '../context/AuthContext';

export function useFormat() {
  const { settings } = useAuth();
  const prefs = settings?.preferences || {};

  /**
   * Format a date string or Date object according to preferred format
   * Options: '6 Nov 2026', '06/11/2026', '2026-11-06'
   */
  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return dateInput; // Return as-is if unparseable

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const dd = day < 10 ? `0${day}` : `${day}`;
    const mm = monthIndex + 1 < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;

    switch (prefs.dateFormat) {
      case '06/11/2026':
        return `${dd}/${mm}/${year}`;
      case '2026-11-06':
        return `${year}-${mm}-${dd}`;
      case '6 Nov 2026':
      default:
        return `${day} ${months[monthIndex]} ${year}`;
    }
  };

  /**
   * Format a number or INR amount according to Indian lakh/crore or International style
   */
  const formatNumber = (num, isCurrency = false) => {
    if (num === null || num === undefined) return '';
    const n = Number(num);
    if (isNaN(n)) return `${num}`;

    if (prefs.numberFormat === 'International') {
      const formatted = new Intl.NumberFormat('en-US').format(n);
      return isCurrency ? `₹${formatted}` : formatted;
    }

    // Default Indian format: lakh / crore
    const formatted = new Intl.NumberFormat('en-IN').format(n);
    return isCurrency ? `₹${formatted}` : formatted;
  };

  return {
    formatDate,
    formatNumber,
    dateFormat: prefs.dateFormat || '6 Nov 2026',
    numberFormat: prefs.numberFormat || 'Indian lakh/crore',
  };
}


import { format, formatDistanceToNow } from 'date-fns';

export const fmtDate = (iso: string) => format(new Date(iso), 'd MMM yyyy');
export const fmtDateTime = (iso: string) => format(new Date(iso), 'd MMM yyyy HH:mm');
export const fmtTimeAgo = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true });
export const fmtCurrency = (n: number) => `£${n.toFixed(2)}`;

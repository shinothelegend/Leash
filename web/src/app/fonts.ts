import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';

export const display = Space_Grotesk({
  subsets: ['latin'], 
  variable: '--font-display', 
  weight: ['500', '600', '700'],
});

export const body = Plus_Jakarta_Sans({
  subsets: ['latin'], 
  variable: '--font-body', 
  weight: ['400', '500', '600', '700'],
});

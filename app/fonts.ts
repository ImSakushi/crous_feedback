// app/fonts.ts
import localFont from 'next/font/local';

export const marianne = localFont({
  src: [
    {
      path: '../public/fonts/Marianne-Thin.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-ThinItalic.otf',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-ExtraBoldItalic.otf',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-marianne',
});

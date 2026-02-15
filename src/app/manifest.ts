import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PeerlyPay',
    short_name: 'PeerlyPay',
    description: 'Earn Global, Spend Local - Trustless ramp for the borderless economy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#d946ef',
    icons: [
      {
        src: '/icons/peerly/64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/icons/peerly/192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/peerly/512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/peerly/512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Helpdesk Ticketing System',
    short_name: 'Helpdesk',
    description: 'Submit and track support tickets efficiently.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: 'https://via.placeholder.com/192.png?text=Icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
         src: 'https://via.placeholder.com/512.png?text=Icon',
         sizes: '512x512',
         type: 'image/png',
      }
    ],
  }
}

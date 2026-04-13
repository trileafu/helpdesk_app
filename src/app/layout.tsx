import type { Metadata } from 'next'
import { Figtree, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const figtree = Figtree({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Helpdesk Ticketing System',
  description: 'Efficiently submit and track your support requests.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

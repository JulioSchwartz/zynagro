import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zynagro — Gestão Inteligente do Campo',
  description: 'Gestão financeira de granjas por lote',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
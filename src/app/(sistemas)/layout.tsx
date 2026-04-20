'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SistemasLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/auth/login')
    })
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const menu = [
    { href: '/dashboard', label: '🏠 Dashboard' },
    { href: '/granjas',   label: '🐔 Granjas' },
    { href: '/lotes',     label: '📦 Lotes' },
    { href: '/relatorios', label: '📊 Relatórios' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* TOPBAR */}
      <div style={{ background: '#1a2e0d', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setMenuAberto(!menuAberto)}
            style={{ background: 'transparent', border: 'none', color: '#f5c842', fontSize: 20, cursor: 'pointer', display: 'none' }}
            className="hamburger">☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#f5c842', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1a2e0d', fontWeight: 900, fontSize: 18 }}>Z</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>zynagro</span>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {menu.map(item => (
            <a key={item.href} href={item.href}
              style={{
                color: pathname === item.href ? '#f5c842' : '#a7d888',
                textDecoration: 'none', padding: '8px 14px', borderRadius: 8,
                fontSize: 14, fontWeight: pathname === item.href ? 700 : 400,
                background: pathname === item.href ? 'rgba(245,200,66,0.1)' : 'transparent'
              }}>
              {item.label}
            </a>
          ))}
        </nav>

        <button onClick={sair}
          style={{ background: 'transparent', border: '1px solid #3d5a2a', color: '#a7d888', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
          Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
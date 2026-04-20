'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [])

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#1a2e0d' }}>

      {/* NAV */}
      <nav style={{ background: '#1a2e0d', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#f5c842', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a2e0d', fontSize: 20, fontWeight: 900 }}>Z</span>
          </div>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>zynagro</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/auth/login" style={{ color: '#7ab648', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Entrar</a>
          <a href="/auth/cadastro" style={{ background: '#7ab648', color: '#fff', padding: '8px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Começar grátis →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1a2e0d 0%, #2d4a1a 60%, #1a2e0d 100%)', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(122,182,72,0.15)', border: '1px solid rgba(122,182,72,0.3)', borderRadius: 999, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ color: '#7ab648', fontSize: 13, fontWeight: 600 }}>🌾 Gestão Inteligente do Campo</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 20px' }}>
            Controle total da sua granja,{' '}
            <span style={{ color: '#f5c842' }}>do lote ao relatório</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40 }}>
            Financeiro, diário de galpão, pesagem, controle sanitário e relatórios — tudo em uma plataforma feita para avicultores brasileiros.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/cadastro" style={{ background: '#7ab648', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>
              Começar grátis por 14 dias →
            </a>
            <a href="/auth/login" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(255,255,255,0.15)' }}>
              Já tenho conta
            </a>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 20 }}>14 dias grátis · Sem cartão · Cancele quando quiser</p>
        </div>

        {/* MINI DASHBOARD MOCKUP */}
        <div style={{ maxWidth: 700, margin: '60px auto 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ background: '#f5c842', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1a2e0d', fontSize: 14, fontWeight: 900 }}>Z</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Zynagro · Granja Boa Vista</span>
            <span style={{ marginLeft: 'auto', background: '#7ab648', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>🔄 Lote em andamento</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Aves vivas', valor: '49.312', cor: '#7ab648' },
              { label: 'Mortalidade', valor: '0,86%', cor: '#f5c842' },
              { label: 'Resultado lote', valor: 'R$ 74.596', cor: '#34d399' },
            ].map(c => (
              <div key={c.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>{c.label}</p>
                <p style={{ color: c.cor, fontSize: 18, fontWeight: 800, margin: '4px 0 0' }}>{c.valor}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#7ab648', fontSize: 13 }}>✓ Pesagem registrada hoje · Dia 18 do lote</span>
            <span style={{ color: '#64748b', fontSize: 12 }}>4 galpões · BRF</span>
          </div>
        </div>
      </section>

      {/* POR QUE */}
      <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#1a2e0d', marginBottom: 48 }}>
            Por que o Zynagro?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { antes: 'Cadernos e planilhas perdidas', depois: 'Tudo registrado digital e em tempo real', emoji: '📓' },
              { antes: 'Mortalidade calculada no papel', depois: 'Cálculo automático por galpão e total', emoji: '🐔' },
              { antes: 'Financeiro no achismo', depois: 'Custo por ave, entradas e saídas por categoria', emoji: '💰' },
              { antes: 'Relatório feito manualmente', depois: 'Relatório mensal e por lote com exportação CSV', emoji: '📊' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 6px', textDecoration: 'line-through' }}>{item.antes}</p>
                    <p style={{ color: '#1a2e0d', fontSize: 14, fontWeight: 700, margin: 0 }}>→ {item.depois}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#1a2e0d', marginBottom: 12 }}>
            Tudo que sua granja precisa
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48 }}>Uma plataforma completa para avicultura integrada brasileira</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '🐔', titulo: 'Gestão de Lotes', desc: 'Controle lotes por galpão com dias restantes, aves vivas e status em tempo real.' },
              { icon: '💰', titulo: 'Financeiro por Lote', desc: 'Entradas e saídas por categoria, custo por ave, resultado do lote automatizado.' },
              { icon: '📓', titulo: 'Diário de Galpão', desc: 'Registre mortalidade, ração e temperatura diariamente por galpão.' },
              { icon: '⚖️', titulo: 'Pesagem Semanal', desc: 'Controle de peso médio por amostragem com evolução ao longo do lote.' },
              { icon: '💉', titulo: 'Controle Sanitário', desc: 'Vacinas, medicamentos, tratamentos e visitas técnicas com histórico completo.' },
              { icon: '📊', titulo: 'Relatórios', desc: 'Análise mensal e por lote, exportação CSV com filtros avançados.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, transition: 'box-shadow 0.2s' }}>
                <span style={{ fontSize: 32 }}>{f.icon}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', margin: '12px 0 8px' }}>{f.titulo}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRADORAS */}
      <section style={{ padding: '48px 32px', background: '#f0fdf4', textAlign: 'center' }}>
        <p style={{ color: '#7ab648', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Compatível com as principais integradoras</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['BRF', 'Aurora', 'Copacol', 'Globoaves', 'Seara', 'Frangosul'].map(i => (
            <span key={i} style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 20px', color: '#1a2e0d', fontWeight: 700, fontSize: 14 }}>{i}</span>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 32px', background: '#1a2e0d', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Pronto para modernizar sua granja?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 36 }}>
            Comece agora com 14 dias grátis. Sem cartão, sem compromisso.
          </p>
          <a href="/auth/cadastro" style={{ background: '#7ab648', color: '#fff', padding: '16px 40px', borderRadius: 12, fontWeight: 800, fontSize: 18, textDecoration: 'none', display: 'inline-block' }}>
            Criar conta grátis →
          </a>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            {['✓ 14 dias grátis', '✓ Sem cartão', '✓ Cancele quando quiser'].map(t => (
              <span key={t} style={{ color: '#7ab648', fontSize: 13, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f1f07', padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ background: '#f5c842', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a2e0d', fontSize: 14, fontWeight: 900 }}>Z</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 700 }}>zynagro</span>
        </div>
        <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
          parte do ecossistema <span style={{ color: '#7ab648' }}>Zyncompany</span> · © 2026 Zynagro · Todos os direitos reservados
        </p>
      </footer>
    </div>
  )
}
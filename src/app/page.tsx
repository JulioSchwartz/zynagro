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
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#1a2e0d', margin: 0, padding: 0 }}>

      {/* NAV */}
      <nav style={{ background: '#1a2e0d', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '2px solid #2d4a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#f5c842', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a2e0d', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>Z</span>
          </div>
          <div>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: 1, display: 'block', lineHeight: 1.1 }}>zynagro</span>
            <span style={{ color: '#7ab648', fontSize: 9, letterSpacing: 3, fontWeight: 600 }}>GESTÃO DO CAMPO</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/auth/login" style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Entrar</a>
          <a href="/auth/cadastro" style={{ background: '#7ab648', color: '#fff', padding: '9px 22px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Acessar sistema
          </a>
        </div>
      </nav>

      {/* HERO — campo de verdade */}
      <section style={{
        background: 'linear-gradient(180deg, #0f1f07 0%, #1a2e0d 50%, #243d12 100%)',
        padding: '96px 32px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Textura de fundo sutil */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(122,182,72,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,200,66,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(122,182,72,0.12)', border: '1px solid rgba(122,182,72,0.25)', borderRadius: 999, padding: '7px 20px', marginBottom: 32 }}>
            <span style={{ fontSize: 16 }}>🌾</span>
            <span style={{ color: '#7ab648', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>AVICULTURA INTEGRADA</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: -1 }}>
            Feito pra quem vive<br />
            <span style={{ color: '#f5c842' }}>dentro do galpão</span>
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, marginBottom: 16, maxWidth: 580, margin: '0 auto 16px' }}>
            Do diário de galpão ao financeiro do lote —<br />
            tudo que o avicultor precisa, sem complicação.
          </p>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 48 }}>
            Pensado para a rotina de quem lida com BRF, Aurora, Copacol e as demais integradoras do sul do Brasil.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/cadastro" style={{
              background: '#7ab648', color: '#fff', padding: '15px 36px',
              borderRadius: 10, fontWeight: 800, fontSize: 16,
              textDecoration: 'none', display: 'inline-block',
              boxShadow: '0 4px 20px rgba(122,182,72,0.35)',
            }}>
              Quero usar o Zynagro
            </a>
            <a href="/auth/login" style={{
              background: 'transparent', color: '#94a3b8',
              padding: '15px 28px', borderRadius: 10, fontWeight: 600,
              fontSize: 16, textDecoration: 'none', display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              Já tenho acesso
            </a>
          </div>
        </div>

        {/* MOCKUP DASHBOARD */}
        <div style={{ maxWidth: 680, margin: '64px auto 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, textAlign: 'left' }}>
          {/* Header mockup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: 0, fontWeight: 600, letterSpacing: 1 }}>LOTE ATUAL</p>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '2px 0 0' }}>Lote #14 · Galpões 1–4</p>
            </div>
            <span style={{ background: 'rgba(122,182,72,0.2)', color: '#7ab648', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(122,182,72,0.3)' }}>
              🔄 Dia 22 / 28
            </span>
          </div>
          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Aves vivas', valor: '49.312', cor: '#7ab648', icon: '🐔' },
              { label: 'Mortalidade', valor: '0,86%', cor: '#f5c842', icon: '📉' },
              { label: 'Peso médio', valor: '2,4 kg', cor: '#60a5fa', icon: '⚖️' },
              { label: 'Resultado', valor: 'R$ 74.596', cor: '#34d399', icon: '💰' },
            ].map(c => (
              <div key={c.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ color: '#64748b', fontSize: 10, margin: 0, fontWeight: 600 }}>{c.icon} {c.label.toUpperCase()}</p>
                <p style={{ color: c.cor, fontSize: 17, fontWeight: 800, margin: '4px 0 0' }}>{c.valor}</p>
              </div>
            ))}
          </div>
          {/* Linha diário */}
          <div style={{ background: 'rgba(122,182,72,0.06)', border: '1px solid rgba(122,182,72,0.15)', borderRadius: 8, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#7ab648', fontSize: 12, fontWeight: 600 }}>✓ Diário registrado hoje · Temperatura: 24°C / 28°C</span>
            <span style={{ color: '#475569', fontSize: 11 }}>Ração: 3.200 kg</span>
          </div>
        </div>
      </section>

      {/* ROTINA DO CAMPO */}
      <section style={{ padding: '80px 32px', background: '#fafaf8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: '#8b5e2a', fontWeight: 700, fontSize: 13, letterSpacing: 2, margin: '0 0 10px' }}>A ROTINA DO AVICULTOR</p>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: '#1a2e0d', margin: 0, lineHeight: 1.2 }}>
              De manhã cedo até o fechamento do lote
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 2 }}>
            {[
              {
                hora: '05:30',
                titulo: 'Abre o galpão',
                desc: 'Registra mortalidade, temperatura e consumo de ração do dia. Tudo num clique, sem papel.',
                icon: '🌅',
                cor: '#f5c842',
              },
              {
                hora: 'Semanal',
                titulo: 'Dia de pesagem',
                desc: 'Lança o peso médio por amostragem. O sistema calcula a média geral do lote automaticamente.',
                icon: '⚖️',
                cor: '#7ab648',
              },
              {
                hora: 'Quando precisar',
                titulo: 'Vacina ou medicamento',
                desc: 'Registra produto, dose, via e galpão. Histórico sanitário sempre em dia para a integradora.',
                icon: '💉',
                cor: '#60a5fa',
              },
              {
                hora: 'No final do mês',
                titulo: 'Fecha o financeiro',
                desc: 'Lança salários, maravalha, energia, manutenção. Custo por ave calculado na hora.',
                icon: '💰',
                cor: '#34d399',
              },
              {
                hora: 'Fim do lote',
                titulo: 'Relatório completo',
                desc: 'Resultado por lote, comparativo mensal, exportação CSV. Tudo pronto pra conversar com a integradora.',
                icon: '📊',
                cor: '#f97316',
              },
              {
                hora: 'Sempre',
                titulo: 'Seus dados, sua granja',
                desc: 'Acessa do celular ou computador. Tudo salvo na nuvem, sem risco de perder caderno ou planilha.',
                icon: '📱',
                cor: '#a78bfa',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff',
                padding: '28px 24px',
                borderLeft: `4px solid ${item.cor}`,
                borderRadius: i === 0 ? '12px 0 0 0' : i === 1 ? '0 12px 0 0' : i === 2 ? '0' : i === 3 ? '0' : i === 4 ? '0 0 0 12px' : '0 0 12px 0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 26 }}>{item.icon}</span>
                  <span style={{ background: `${item.cor}22`, color: item.cor, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, alignSelf: 'center', letterSpacing: 0.5 }}>{item.hora}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e0d', margin: '0 0 8px' }}>{item.titulo}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRADORAS — sem exagero */}
      <section style={{ padding: '56px 32px', background: '#1a2e0d' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#7ab648', fontWeight: 700, fontSize: 13, letterSpacing: 2, margin: '0 0 8px' }}>INTEGRAÇÃO</p>
          <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
            Funciona com as integradoras que você já conhece
          </h3>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 32px' }}>
            Padrão de lote de 28 dias, pesagem por amostragem, pagamento por ave/kg — tudo já configurado do jeito certo.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['BRF', 'Aurora', 'Copacol', 'Globoaves', 'Seara', 'Frangosul'].map(i => (
              <span key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '8px 20px',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: 14,
              }}>{i}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CONTRASTE — simples e direto */}
      <section style={{ padding: '80px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: '#8b5e2a', fontWeight: 700, fontSize: 13, letterSpacing: 2, margin: '0 0 10px' }}>ANTES × DEPOIS</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1a2e0d', margin: 0 }}>Chega de caderno molhado de orvalho</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {/* Antes */}
            <div style={{ background: '#fafaf8', border: '2px solid #e2e8f0', borderRadius: 14, padding: 28 }}>
              <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 20 }}>❌ SEM O ZYNAGRO</p>
              {[
                'Caderninho que molha, rasga e some',
                'Planilha que ninguém entende depois',
                'Mortalidade somada na mão',
                'Não sabe o custo por ave no final',
                'Relatório feito na véspera do fechamento',
                'Histórico sanitário espalhado em papéis',
              ].map((t, i) => (
                <p key={i} style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 10px', paddingLeft: 12, borderLeft: '2px solid #e2e8f0', lineHeight: 1.5 }}>{t}</p>
              ))}
            </div>
            {/* Depois */}
            <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: 14, padding: 28 }}>
              <p style={{ color: '#7ab648', fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 20 }}>✅ COM O ZYNAGRO</p>
              {[
                'Diário no celular, mesmo sem sinal bom',
                'Dados organizados por galpão e lote',
                'Mortalidade acumulada calculada na hora',
                'Custo por ave atualizado em tempo real',
                'Relatório pronto com um clique',
                'Histórico sanitário completo e seguro',
              ].map((t, i) => (
                <p key={i} style={{ color: '#1a2e0d', fontSize: 14, margin: '0 0 10px', paddingLeft: 12, borderLeft: '2px solid #7ab648', lineHeight: 1.5, fontWeight: 500 }}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 32px', background: 'linear-gradient(135deg, #0f1f07, #1a2e0d)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <span style={{ fontSize: 48 }}>🌾</span>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '16px 0 12px', lineHeight: 1.2 }}>
            Sua granja merece<br />uma gestão de verdade
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
            Desenvolvido para a realidade do avicultor brasileiro.<br />
            Entre em contato e comece a usar.
          </p>
          <a href="/auth/cadastro" style={{
            background: '#7ab648', color: '#fff',
            padding: '16px 44px', borderRadius: 12,
            fontWeight: 800, fontSize: 18,
            textDecoration: 'none', display: 'inline-block',
            boxShadow: '0 6px 24px rgba(122,182,72,0.4)',
          }}>
            Quero usar o Zynagro
          </a>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 20 }}>
            Dúvidas? Fale com a gente em <span style={{ color: '#7ab648' }}>suportezynagro@gmail.com</span>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a150500', background: '#0f1f07', padding: '28px 32px', borderTop: '1px solid #1a2e0d' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#f5c842', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1a2e0d', fontSize: 16, fontWeight: 900 }}>Z</span>
            </div>
            <div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, display: 'block', lineHeight: 1.1 }}>zynagro</span>
              <span style={{ color: '#475569', fontSize: 10, letterSpacing: 2 }}>GESTÃO DO CAMPO</span>
            </div>
          </div>
          <p style={{ color: '#334155', fontSize: 12, margin: 0 }}>
            parte do ecossistema <span style={{ color: '#7ab648' }}>Zyncompany</span> · © 2026 · Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
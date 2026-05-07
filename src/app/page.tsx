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
    <div style={{ fontFamily: "'Inter', sans-serif", margin: 0, padding: 0, color: '#1a2e0d', background: '#fff' }}>

      {/* ── NAV INSTITUCIONAL ── */}
      <nav style={{
        background: '#1a2e0d',
        padding: '0 48px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '3px solid #f5c842',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#f5c842', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a2e0d', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>Z</span>
          </div>
          <div>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: 2, display: 'block', lineHeight: 1 }}>ZYNAGRO</span>
            <span style={{ color: '#f5c842', fontSize: 9, letterSpacing: 4, fontWeight: 600 }}>GESTÃO DO CAMPO</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#sobre" style={{ color: '#a7d888', fontWeight: 500, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Sobre</a>
          <a href="#funcionalidades" style={{ color: '#a7d888', fontWeight: 500, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Funcionalidades</a>
          <a href="#integradoras" style={{ color: '#a7d888', fontWeight: 500, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Integradoras</a>
          <a href="#planos" style={{ color: '#a7d888', fontWeight: 500, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Planos</a>
          <a href="#contato" style={{ color: '#a7d888', fontWeight: 500, fontSize: 14, textDecoration: 'none', letterSpacing: 0.5 }}>Contato</a>
          <a href="/auth/login" style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '7px 20px',
            borderRadius: 4,
            letterSpacing: 1,
          }}>ACESSAR SISTEMA</a>
        </div>
      </nav>

      {/* ── HERO INSTITUCIONAL ── */}
      <section style={{
        background: 'linear-gradient(to bottom, #0a1a05 0%, #1a2e0d 40%, #2d4a1a 100%)',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '0 48px',
      }}>
        {/* Padrão geométrico de fundo — remete a galpão */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(122,182,72,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(122,182,72,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />
        {/* Luz lateral direita */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
          background: 'radial-gradient(ellipse at 80% 50%, rgba(122,182,72,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Linha dourada decorativa */}
        <div style={{
          position: 'absolute', left: 48, top: '15%', bottom: '15%',
          width: 3, background: 'linear-gradient(to bottom, transparent, #f5c842, transparent)',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', position: 'relative', paddingLeft: 28 }}>
          <div style={{ maxWidth: 660 }}>
            {/* Selo institucional */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
              <div style={{ height: 2, width: 48, background: '#f5c842', marginRight: 4 }} />
              <span style={{ color: '#f5c842', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>TECNOLOGIA PARA O CAMPO BRASILEIRO</span>
            </div>

            <h1 style={{
              fontSize: 58,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.05,
              margin: '0 0 28px',
              letterSpacing: -1,
            }}>
              O campo evoluiu.<br />
              <span style={{ color: '#7ab648' }}>A gestão também</span><br />
              <span style={{ color: '#f5c842', fontSize: 48 }}>precisa evoluir.</span>
            </h1>

            <p style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.8,
              marginBottom: 48,
              maxWidth: 520,
            }}>
              Zynagro é a plataforma de gestão desenvolvida para o avicultor integrado brasileiro. Controle completo do lote, do galpão à integradora — com a seriedade que o campo merece.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="/auth/cadastro" style={{
                background: '#7ab648',
                color: '#fff',
                padding: '16px 40px',
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                letterSpacing: 2,
                display: 'inline-block',
                borderRadius: 2,
              }}>
                ACESSAR A PLATAFORMA
              </a>
              <a href="#sobre" style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                textDecoration: 'none',
                fontWeight: 500,
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                Conheça mais ↓
              </a>
            </div>

            {/* Números institucionais */}
            <div style={{ display: 'flex', gap: 48, marginTop: 72, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { num: '28', label: 'dias de lote padrão BRF' },
                { num: '4', label: 'galpões controlados por lote' },
                { num: '100%', label: 'focado em avicultura integrada' },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ color: '#f5c842', fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1 }}>{s.num}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '6px 0 0', lineHeight: 1.4, maxWidth: 100 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOBRE — FAIXA DOURADA ── */}
      <div id="sobre" style={{ background: '#f5c842', padding: '20px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <p style={{ margin: 0, color: '#1a2e0d', fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>
            Desenvolvido por quem entende a rotina do avicultor integrado do sul do Brasil — da chegada do pinto até o fechamento com a integradora.
          </p>
        </div>
      </div>

      {/* ── MISSÃO ── */}
      <section style={{ background: '#f7f7f5', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ height: 1, width: 32, background: '#8b5e2a' }} />
              <span style={{ color: '#8b5e2a', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>NOSSA MISSÃO</span>
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#1a2e0d', lineHeight: 1.15, margin: '0 0 24px' }}>
              Dar ao produtor o controle que ele sempre mereceu.
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              Por décadas, o avicultor integrado gerenciou seus lotes em cadernos, planilhas improvisadas e memória. Com o Zynagro, cada dado do galpão tem seu lugar — organizado, seguro e acessível.
            </p>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.8 }}>
              Não somos uma empresa de tecnologia tentando entrar no campo. Somos uma ferramenta construída a partir da realidade de quem acorda às 5h da manhã pra abrir o galpão.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { icon: '📋', titulo: 'Registro diário por galpão', desc: 'Mortalidade, ração, temperatura. Rápido, do celular, no próprio galpão.' },
              { icon: '⚖️', titulo: 'Pesagem e evolução do lote', desc: 'Acompanhe o peso médio semana a semana e veja a curva de crescimento.' },
              { icon: '💉', titulo: 'Histórico sanitário completo', desc: 'Vacinas, medicamentos e tratamentos registrados com produto, dose e lote.' },
              { icon: '📊', titulo: 'Financeiro e relatórios', desc: 'Custo por ave, resultado do lote, comparativo mensal. Tudo pronto.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: '3px solid #1a2e0d' }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, color: '#1a2e0d', fontSize: 15, margin: '0 0 4px' }}>{item.titulo}</p>
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" style={{ background: '#1a2e0d', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: '#f5c842' }} />
              <span style={{ color: '#f5c842', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>PLATAFORMA</span>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1, maxWidth: 560 }}>
              Tudo que o lote precisa, em um só lugar.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1 }}>
            {[
              {
                num: '01', titulo: 'Gestão de Lotes',
                desc: 'Crie e acompanhe cada lote com data de início, duração, número de aves e galpões. Dia atual e dias restantes sempre visíveis.',
                cor: '#7ab648',
              },
              {
                num: '02', titulo: 'Diário do Galpão',
                desc: 'Registro diário de mortalidade, consumo de ração e temperatura por galpão. Mortalidade acumulada e aves vivas calculadas automaticamente.',
                cor: '#f5c842',
              },
              {
                num: '03', titulo: 'Pesagem Semanal',
                desc: 'Lance o peso médio por amostragem de cada galpão. O sistema calcula a média geral do lote e exibe a curva de evolução.',
                cor: '#7ab648',
              },
              {
                num: '04', titulo: 'Controle Sanitário',
                desc: 'Histórico completo de vacinas, medicamentos, tratamentos e visitas técnicas — com produto, dose, via de aplicação e fabricante.',
                cor: '#f5c842',
              },
              {
                num: '05', titulo: 'Financeiro por Lote',
                desc: 'Lançamento de entradas e saídas por categoria. Custo por ave, resultado do lote e detalhamento percentual por tipo de despesa.',
                cor: '#7ab648',
              },
              {
                num: '06', titulo: 'Relatórios e Exportação',
                desc: 'Análise mensal e por lote. Exportação em CSV com filtros por período e categoria. Importação de histórico disponível.',
                cor: '#f5c842',
              },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '32px 28px', borderTop: `3px solid ${f.cor}` }}>
                <p style={{ color: f.cor, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: '0 0 16px' }}>{f.num}</p>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>{f.titulo}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALERTA MORTALIDADE — DESTAQUE ── */}
      <section style={{ background: '#fff', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ height: 1, width: 32, background: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>INTELIGÊNCIA NO CAMPO</span>
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#1a2e0d', lineHeight: 1.15, margin: '0 0 20px' }}>
              Alerta automático quando a mortalidade ultrapassa o limite.
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              O sistema monitora a mortalidade acumulada do lote e emite um alerta vermelho no dashboard quando ultrapassa 3% — o limite recomendado para avicultura integrada.
            </p>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.8 }}>
              Também é possível acompanhar a evolução através de gráficos de mortalidade diária, acumulada e percentual — e a curva de peso médio do lote ao longo dos dias.
            </p>
          </div>
          {/* Mockup do alerta */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 10, padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ color: '#dc2626', fontWeight: 800, fontSize: 14, margin: 0 }}>Alerta: Mortalidade acima do limite!</p>
                <p style={{ color: '#991b1b', fontSize: 12, margin: '4px 0 0' }}>Lote #14 · 3,4% · 1.700 aves perdidas</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Mortalidade', valor: '3,4%', cor: '#dc2626', bg: '#fef2f2' },
                { label: 'Aves vivas', valor: '48.300', cor: '#1a2e0d', bg: '#f0fdf4' },
                { label: 'Dia do lote', valor: 'Dia 18', cor: '#1a2e0d', bg: '#f8fafc' },
                { label: 'Peso médio', valor: '1.240g', cor: '#7ab648', bg: '#f0fdf4' },
              ].map((c, i) => (
                <div key={i} style={{ background: c.bg, borderRadius: 8, padding: '12px 14px' }}>
                  <p style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, margin: 0, letterSpacing: 1 }}>{c.label.toUpperCase()}</p>
                  <p style={{ color: c.cor, fontSize: 18, fontWeight: 800, margin: '4px 0 0' }}>{c.valor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTEGRADORAS ── */}
      <section id="integradoras" style={{ background: '#1a2e0d', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 32, background: '#8b5e2a' }} />
            <span style={{ color: '#8b5e2a', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>COMPATIBILIDADE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.1, maxWidth: 480 }}>
              Preparado para as principais integradoras do Brasil.
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: 0 }}>
              Padrões de lote, pesagem e pagamento por ave/kg já configurados conforme a realidade de cada integradora.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
            {[
              { nome: 'BRF', detalhe: 'Sul e Centro-Oeste' },
              { nome: 'Aurora', detalhe: 'Sul e Centro-Oeste' },
              { nome: 'Copacol', detalhe: 'Paraná' },
              { nome: 'Globoaves', detalhe: 'Sul do Brasil' },
              { nome: 'Seara', detalhe: 'Nacional' },
              { nome: 'Frangosul', detalhe: 'Rio Grande do Sul' },
            ].map((int, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '24px 20px', borderBottom: '3px solid #f5c842', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: '#fff', margin: '0 0 6px' }}>{int.nome}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0, fontWeight: 500 }}>{int.detalhe}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── PLANOS ── */}
      <section id="planos" style={{ background: '#f7f7f5', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: '#8b5e2a' }} />
              <span style={{ color: '#8b5e2a', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>PLANOS</span>
              <div style={{ height: 1, width: 32, background: '#8b5e2a' }} />
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#1a2e0d', margin: '0 0 16px', lineHeight: 1.1 }}>
              Simples. Sem surpresas.
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              14 dias grátis para testar tudo. Cancele quando quiser.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 760, margin: '0 auto' }}>
            {/* Plano Mensal */}
            <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: 16, padding: '40px 36px' }}>
              <p style={{ color: '#8b5e2a', fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: '0 0 20px' }}>MENSAL</p>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#1a2e0d' }}>R$ 59,90</span>
                <span style={{ fontSize: 15, color: '#94a3b8', marginLeft: 6 }}>/mês</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 32 }}>
                {[
                  'Gestão completa de lotes',
                  'Diário do galpão ilimitado',
                  'Pesagem e controle sanitário',
                  'Financeiro por lote',
                  'Relatórios e exportação CSV',
                  'Suporte por e-mail',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#7ab648', fontSize: 16, fontWeight: 700 }}>✓</span>
                    <span style={{ color: '#374151', fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/auth/cadastro" style={{
                display: 'block', textAlign: 'center',
                background: '#1a2e0d', color: '#fff',
                padding: '14px 24px', borderRadius: 8,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                letterSpacing: 1,
              }}>
                COMEÇAR GRÁTIS →
              </a>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, margin: '12px 0 0' }}>14 dias grátis · sem cartão</p>
            </div>

            {/* Plano Anual — destaque */}
            <div style={{ background: '#1a2e0d', border: '2px solid #f5c842', borderRadius: 16, padding: '40px 36px', position: 'relative' as const }}>
              <div style={{
                position: 'absolute' as const, top: -14, left: '50%', transform: 'translateX(-50%)',
                background: '#f5c842', color: '#1a2e0d',
                fontSize: 11, fontWeight: 800, letterSpacing: 2,
                padding: '5px 18px', borderRadius: 100,
              }}>MELHOR VALOR</div>
              <p style={{ color: '#f5c842', fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: '0 0 20px' }}>ANUAL</p>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#fff' }}>R$ 499,90</span>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>/ano</span>
              </div>
              <p style={{ color: '#7ab648', fontSize: 13, fontWeight: 600, margin: '0 0 28px' }}>
                ≈ R$ 41,65/mês · economia de 30%
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 32 }}>
                {[
                  'Tudo do plano mensal',
                  'Economia de R$ 219,00/ano',
                  'Prioridade no suporte',
                  'Acesso a novas funcionalidades',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#f5c842', fontSize: 16, fontWeight: 700 }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/auth/cadastro" style={{
                display: 'block', textAlign: 'center',
                background: '#f5c842', color: '#1a2e0d',
                padding: '14px 24px', borderRadius: 8,
                fontWeight: 800, fontSize: 14, textDecoration: 'none',
                letterSpacing: 1,
              }}>
                COMEÇAR GRÁTIS →
              </a>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '12px 0 0' }}>14 dias grátis · sem cartão</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section id="contato" style={{ background: '#1a2e0d', padding: '80px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', right: -100, top: -100,
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(122,182,72,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: '#f5c842' }} />
            <span style={{ color: '#f5c842', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>CONTATO</span>
            <div style={{ height: 1, width: 32, background: '#f5c842' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 16px' }}>
            Alguma dúvida?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
            Nossa equipe acompanha cada produtor no processo de cadastro e configuração da granja.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 4, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>✉️</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0, letterSpacing: 2 }}>E-MAIL</p>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>suportezynagro@gmail.com</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: 'rgba(122,182,72,0.1)', border: '1px solid rgba(122,182,72,0.2)', borderRadius: 4, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>🌐</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0, letterSpacing: 2 }}>PLATAFORMA</p>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>zynagro.com.br</p>
              </div>
            </div>
          </div>
          <a href="/auth/cadastro" style={{
            display: 'inline-block',
            background: '#7ab648', color: '#fff',
            padding: '16px 48px', borderRadius: 4,
            fontWeight: 800, fontSize: 14, textDecoration: 'none',
            letterSpacing: 2,
          }}>
            CADASTRAR MINHA GRANJA →
          </a>
        </div>
      </section>

      {/* ── FOOTER INSTITUCIONAL ── */}
      <footer style={{ background: '#0a1a05', padding: '48px 48px 32px', borderTop: '3px solid #f5c842' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
            {/* Marca */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#f5c842', borderRadius: 6, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#1a2e0d', fontSize: 20, fontWeight: 900 }}>Z</span>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, display: 'block', letterSpacing: 2 }}>ZYNAGRO</span>
                  <span style={{ color: '#f5c842', fontSize: 8, letterSpacing: 3 }}>GESTÃO DO CAMPO</span>
                </div>
              </div>
              <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                Plataforma de gestão desenvolvida para o avicultor integrado brasileiro.
              </p>
            </div>
            {/* Links */}
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 3, marginBottom: 16 }}>PLATAFORMA</p>
              {['Dashboard', 'Gestão de Lotes', 'Diário do Galpão', 'Controle Sanitário', 'Relatórios'].map(l => (
                <p key={l} style={{ color: '#475569', fontSize: 13, margin: '0 0 8px' }}>{l}</p>
              ))}
            </div>
            {/* Integradoras */}
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 3, marginBottom: 16 }}>INTEGRADORAS</p>
              {['BRF', 'Aurora', 'Copacol', 'Globoaves', 'Seara', 'Frangosul'].map(l => (
                <p key={l} style={{ color: '#475569', fontSize: 13, margin: '0 0 8px' }}>{l}</p>
              ))}
            </div>
            {/* Contato */}
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 3, marginBottom: 16 }}>CONTATO</p>
              <p style={{ color: '#475569', fontSize: 13, margin: '0 0 8px' }}>suportezynagro@gmail.com</p>
              <p style={{ color: '#475569', fontSize: 13, margin: '0 0 24px' }}>zynagro.com.br</p>
              <p style={{ color: '#334155', fontSize: 11, letterSpacing: 1 }}>ECOSSISTEMA</p>
              <p style={{ color: '#7ab648', fontSize: 13, margin: '4px 0 0', fontWeight: 600 }}>Zyncompany</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#1e3a1a', fontSize: 12, margin: 0 }}>© 2026 Zynagro · Todos os direitos reservados</p>
            <p style={{ color: '#1e3a1a', fontSize: 12, margin: 0 }}>parte do ecossistema <span style={{ color: '#2d4a1a' }}>Zyncompany</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

const CATEGORIAS_SAIDA = [
  'Funcionários', 'Diárias', 'Maravalha', 'Pellets',
  'Alimentação/Combustível', 'Manutenções', 'Benfeitorias',
  'Adm/Internet', 'Seguro', 'Energia', 'Solar Investimento',
  'Divisão de Sócios', 'Aplicações',
]

export default function Relatorios() {
  const { empresaId, loading } = useEmpresa()
  const router = useRouter()
  const [lotes, setLotes] = useState<any[]>([])
  const [movimentos, setMovimentos] = useState<any[]>([])
  const [abaAtiva, setAbaAtiva] = useState<'lotes' | 'mensal'>('lotes')
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  async function carregar() {
    const [{ data: lotesData }, { data: movData }] = await Promise.all([
      supabase.from('lotes').select('*').eq('empresa_id', empresaId).order('numero', { ascending: true }),
      supabase.from('lote_movimentos').select('*').eq('empresa_id', empresaId),
    ])
    setLotes(lotesData || [])
    setMovimentos(movData || [])
  }

  function format(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function getMov(loteId: string, tipo: string, categoria?: string) {
    return movimentos.filter(m =>
      m.lote_id === loteId &&
      m.tipo === tipo &&
      (categoria ? m.categoria === categoria : true)
    ).reduce((a, m) => a + Number(m.valor), 0)
  }

  // Filtra lotes pelo ano selecionado
  const lotesFiltrados = lotes.filter(l =>
    new Date(l.data_inicio).getFullYear() === anoSelecionado
  )

  // Anos disponíveis
  const anos = [...new Set(lotes.map(l => new Date(l.data_inicio).getFullYear()))].sort()
  if (!anos.includes(anoSelecionado) && anos.length > 0) setAnoSelecionado(anos[anos.length - 1])

  // Dados mensais
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const dadosMensais = meses.map((mes, idx) => {
    const lotesDoMes = lotes.filter(l => {
      const d = new Date(l.data_inicio)
      return d.getFullYear() === anoSelecionado && d.getMonth() === idx
    })
    const ids = lotesDoMes.map(l => l.id)
    const movDoMes = movimentos.filter(m => ids.includes(m.lote_id))
    const entradas = movDoMes.filter(m => m.tipo === 'entrada').reduce((a, m) => a + Number(m.valor), 0)
    const saidas = movDoMes.filter(m => m.tipo === 'saida').reduce((a, m) => a + Number(m.valor), 0)
    const catSaidas = CATEGORIAS_SAIDA.reduce((acc, cat) => {
      acc[cat] = movDoMes.filter(m => m.tipo === 'saida' && m.categoria === cat).reduce((a, m) => a + Number(m.valor), 0)
      return acc
    }, {} as Record<string, number>)
    return { mes, entradas, saidas, saldo: entradas - saidas, catSaidas, temDados: entradas > 0 || saidas > 0 }
  })

  if (loading) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>📊 Relatórios</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Análise financeira por lote e mensal</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Ano:</label>
          <select value={anoSelecionado} onChange={e => setAnoSelecionado(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff' }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
            {anos.length === 0 && <option value={anoSelecionado}>{anoSelecionado}</option>}
          </select>
        </div>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
        {[
          { key: 'lotes', label: '📦 Por Lote' },
          { key: 'mensal', label: '📅 Mensal' },
        ].map(aba => (
          <button key={aba.key} onClick={() => setAbaAtiva(aba.key as any)}
            style={{ padding: '12px 24px', border: 'none', background: 'transparent', fontWeight: 700, fontSize: 14, cursor: 'pointer', borderBottom: abaAtiva === aba.key ? '3px solid #2d6a1a' : '3px solid transparent', color: abaAtiva === aba.key ? '#2d6a1a' : '#94a3b8', marginBottom: -2 }}>
            {aba.label}
          </button>
        ))}
      </div>

      {/* ABA — POR LOTE */}
      {abaAtiva === 'lotes' && (
        <div>
          {lotesFiltrados.length === 0 ? (
            <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 16, padding: 40, textAlign: 'center' }}>
              <p style={{ color: '#16a34a', fontWeight: 600 }}>Nenhum lote encontrado para {anoSelecionado}</p>
            </div>
          ) : (
            <>
              {/* RESUMO GERAL */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Total Lotes', valor: lotesFiltrados.length, tipo: 'numero', cor: '#1a2e0d' },
                  { label: 'Total Entradas', valor: lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'entrada'), 0), tipo: 'moeda', cor: '#16a34a' },
                  { label: 'Total Saídas', valor: lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'saida'), 0), tipo: 'moeda', cor: '#dc2626' },
                  { label: 'Resultado', valor: lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'entrada') - getMov(l.id, 'saida'), 0), tipo: 'moeda', cor: '#2563eb' },
                ].map(card => (
                  <div key={card.label} style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${card.cor}` }}>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{card.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: card.cor, marginTop: 4 }}>
                      {card.tipo === 'moeda' ? format(card.valor) : card.valor}
                    </p>
                  </div>
                ))}
              </div>

              {/* TABELA POR LOTE */}
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#1a2e0d', color: '#fff' }}>
                      <th style={th}>Lote</th>
                      <th style={th}>Período</th>
                      <th style={th}>Status</th>
                      <th style={th}>Aves</th>
                      <th style={th}>Entradas</th>
                      <th style={th}>Saídas</th>
                      <th style={th}>Resultado</th>
                      <th style={th}>Custo/Ave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesFiltrados.map((lote, i) => {
                      const entr = getMov(lote.id, 'entrada')
                      const said = getMov(lote.id, 'saida')
                      const resultado = entr - said
                      const custoAve = lote.num_aves && said > 0 ? said / lote.num_aves : null
                      return (
                        <tr key={lote.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', cursor: 'pointer' }}
                          onClick={() => router.push(`/lotes/${lote.id}`)}>
                          <td style={td}><strong>Lote #{lote.numero}</strong></td>
                          <td style={td}>
                            {new Date(lote.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                            {lote.data_fim && ` → ${new Date(lote.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                          </td>
                          <td style={td}>
                            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: lote.status === 'em_andamento' ? '#dcfce7' : '#f1f5f9', color: lote.status === 'em_andamento' ? '#15803d' : '#64748b' }}>
                              {lote.status === 'em_andamento' ? '🔄 Andamento' : '✅ Fechado'}
                            </span>
                          </td>
                          <td style={{ ...td, textAlign: 'center' }}>{lote.num_aves ? lote.num_aves.toLocaleString() : '-'}</td>
                          <td style={{ ...td, color: '#16a34a', fontWeight: 700 }}>{format(entr)}</td>
                          <td style={{ ...td, color: '#dc2626', fontWeight: 700 }}>{format(said)}</td>
                          <td style={{ ...td, color: resultado >= 0 ? '#16a34a' : '#dc2626', fontWeight: 800 }}>{format(resultado)}</td>
                          <td style={{ ...td, color: '#8b5e2a', fontWeight: 600 }}>{custoAve ? format(custoAve) : '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2e0d', color: '#fff', fontWeight: 700 }}>
                      <td style={td} colSpan={4}>TOTAL</td>
                      <td style={{ ...td, color: '#86efac' }}>{format(lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'entrada'), 0))}</td>
                      <td style={{ ...td, color: '#fca5a5' }}>{format(lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'saida'), 0))}</td>
                      <td style={{ ...td, color: '#f5c842' }}>{format(lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'entrada') - getMov(l.id, 'saida'), 0))}</td>
                      <td style={td}>—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DETALHAMENTO POR CATEGORIA */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>💸 % de Custo por Categoria</h2>
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ ...th, color: '#374151', background: '#f8fafc' }}>Categoria</th>
                        {lotesFiltrados.map(l => (
                          <th key={l.id} style={{ ...th, color: '#374151', background: '#f8fafc' }}>Lote #{l.numero}</th>
                        ))}
                        <th style={{ ...th, color: '#374151', background: '#f8fafc' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CATEGORIAS_SAIDA.map((cat, i) => {
                        const totalCat = lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'saida', cat), 0)
                        if (totalCat === 0) return null
                        return (
                          <tr key={cat} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={td}>{cat}</td>
                            {lotesFiltrados.map(l => (
                              <td key={l.id} style={{ ...td, textAlign: 'right' }}>
                                {getMov(l.id, 'saida', cat) > 0 ? format(getMov(l.id, 'saida', cat)) : '-'}
                              </td>
                            ))}
                            <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{format(totalCat)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ABA — MENSAL */}
      {abaAtiva === 'mensal' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a2e0d', color: '#fff' }}>
                  <th style={th}>Mês</th>
                  <th style={th}>Entradas</th>
                  <th style={th}>Saídas</th>
                  <th style={th}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {dadosMensais.map((d, i) => (
                  <tr key={d.mes} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', opacity: d.temDados ? 1 : 0.4 }}>
                    <td style={td}><strong>{d.mes}</strong></td>
                    <td style={{ ...td, color: '#16a34a', fontWeight: d.temDados ? 700 : 400 }}>{format(d.entradas)}</td>
                    <td style={{ ...td, color: '#dc2626', fontWeight: d.temDados ? 700 : 400 }}>{format(d.saidas)}</td>
                    <td style={{ ...td, color: d.saldo >= 0 ? '#16a34a' : '#dc2626', fontWeight: 800 }}>{format(d.saldo)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#1a2e0d', color: '#fff', fontWeight: 700 }}>
                  <td style={td}>TOTAL {anoSelecionado}</td>
                  <td style={{ ...td, color: '#86efac' }}>{format(dadosMensais.reduce((a, d) => a + d.entradas, 0))}</td>
                  <td style={{ ...td, color: '#fca5a5' }}>{format(dadosMensais.reduce((a, d) => a + d.saidas, 0))}</td>
                  <td style={{ ...td, color: '#f5c842' }}>{format(dadosMensais.reduce((a, d) => a + d.saldo, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* DETALHAMENTO MENSAL POR CATEGORIA */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>💸 Saídas por Categoria — {anoSelecionado}</h2>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ ...th, color: '#374151', background: '#f8fafc' }}>Categoria</th>
                    {dadosMensais.filter(d => d.temDados).map(d => (
                      <th key={d.mes} style={{ ...th, color: '#374151', background: '#f8fafc' }}>{d.mes.slice(0, 3)}</th>
                    ))}
                    <th style={{ ...th, color: '#374151', background: '#f8fafc' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIAS_SAIDA.map((cat, i) => {
                    const mesesComDados = dadosMensais.filter(d => d.temDados)
                    const totalCat = mesesComDados.reduce((a, d) => a + (d.catSaidas[cat] || 0), 0)
                    if (totalCat === 0) return null
                    return (
                      <tr key={cat} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={td}>{cat}</td>
                        {mesesComDados.map(d => (
                          <td key={d.mes} style={{ ...td, textAlign: 'right' }}>
                            {d.catSaidas[cat] > 0 ? format(d.catSaidas[cat]) : '-'}
                          </td>
                        ))}
                        <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{format(totalCat)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }
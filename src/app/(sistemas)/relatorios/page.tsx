'use client'
import { useEffect, useState, useRef } from 'react'
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
  const [importando, setImportando] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const anos = Array.from(new Set(lotes.map(l => new Date(l.data_inicio).getFullYear()))).sort()
  const lotesFiltrados = lotes.filter(l => new Date(l.data_inicio).getFullYear() === anoSelecionado)

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

  // EXPORTAR CSV — Por Lote
  function exportarCSVLotes() {
    const header = ['Lote','Data Início','Data Fim','Status','Aves','Entradas','Saídas','Resultado','Custo/Ave']
    const rows = lotesFiltrados.map(l => {
      const entr = getMov(l.id, 'entrada')
      const said = getMov(l.id, 'saida')
      const result = entr - said
      const custo = l.num_aves && said > 0 ? (said / l.num_aves).toFixed(2) : '-'
      return [
        `Lote #${l.numero}`,
        new Date(l.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR'),
        l.data_fim ? new Date(l.data_fim + 'T12:00:00').toLocaleDateString('pt-BR') : '-',
        l.status === 'em_andamento' ? 'Em andamento' : 'Fechado',
        l.num_aves || '-',
        entr.toFixed(2),
        said.toFixed(2),
        result.toFixed(2),
        custo,
      ]
    })
    const csv = [header, ...rows].map(r => r.join(';')).join('\n')
    baixarCSV(csv, `zynagro-lotes-${anoSelecionado}.csv`)
  }

  // EXPORTAR CSV — Mensal
  function exportarCSVMensal() {
    const header = ['Mês','Entradas','Saídas','Resultado']
    const rows = dadosMensais.map(d => [d.mes, d.entradas.toFixed(2), d.saidas.toFixed(2), d.saldo.toFixed(2)])
    const csv = [header, ...rows].map(r => r.join(';')).join('\n')
    baixarCSV(csv, `zynagro-mensal-${anoSelecionado}.csv`)
  }

  // BAIXAR MODELO CSV para importação
  function baixarModelo() {
    const header = ['lote_numero','data_inicio','data_fim','num_aves','tipo','categoria','data','historico','documento','valor']
    const exemplo = [
      '1','2025-01-01','2025-01-28','32000','entrada','Pagamento Integradora','2025-01-28','Pagamento BRF lote 1','NF001','85000.00',
    ]
    const csv = [header, exemplo].map(r => r.join(';')).join('\n')
    baixarCSV(csv, 'modelo-importacao-zynagro.csv')
  }

  function baixarCSV(csv: string, nome: string) {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nome
    a.click()
    URL.revokeObjectURL(url)
  }

  // IMPORTAR CSV
  async function importarCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportando(true)
    setImportResult(null)

    const text = await file.text()
    const linhas = text.split('\n').filter(l => l.trim())
    const header = linhas[0].split(';').map(h => h.trim().replace(/\r/g, ''))
    const dados = linhas.slice(1)

    let lotesImportados = 0
    let movImportados = 0
    let erros = 0

    // Mapeia lotes já existentes por número
    const lotesExistentes: Record<number, string> = {}
    lotes.forEach(l => { lotesExistentes[l.numero] = l.id })

    for (const linha of dados) {
      if (!linha.trim()) continue
      const cols = linha.split(';').map(c => c.trim().replace(/\r/g, ''))
      const row: Record<string, string> = {}
      header.forEach((h, i) => { row[h] = cols[i] || '' })

      try {
        const numLote = Number(row['lote_numero'])
        let loteId = lotesExistentes[numLote]

        // Cria lote se não existir
        if (!loteId && row['data_inicio']) {
          const dataFim = row['data_fim'] || (() => {
            const d = new Date(row['data_inicio'])
            d.setDate(d.getDate() + 28)
            return d.toISOString().split('T')[0]
          })()
          const { data: novoLote } = await supabase.from('lotes').insert({
            empresa_id: empresaId,
            numero: numLote,
            data_inicio: row['data_inicio'],
            data_fim: dataFim,
            num_aves: row['num_aves'] ? Number(row['num_aves']) : null,
            status: 'fechado',
          }).select().single()
          if (novoLote) {
            loteId = novoLote.id
            lotesExistentes[numLote] = loteId
            lotesImportados++
          }
        }

        // Insere movimento
        if (loteId && row['tipo'] && row['categoria'] && row['valor']) {
          await supabase.from('lote_movimentos').insert({
            lote_id: loteId,
            empresa_id: empresaId,
            data: row['data'] || row['data_inicio'],
            tipo: row['tipo'],
            categoria: row['categoria'],
            historico: row['historico'] || row['categoria'],
            documento: row['documento'] || null,
            valor: Number(row['valor'].replace(',', '.')),
          })
          movImportados++
        }
      } catch {
        erros++
      }
    }

    await carregar()
    setImportando(false)
    setImportResult(`✅ Importação concluída! ${lotesImportados} lote(s) criado(s), ${movImportados} movimento(s) importado(s)${erros > 0 ? `, ${erros} erro(s)` : ''}.`)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (loading) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>📊 Relatórios</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Análise financeira por lote e mensal</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Ano:</label>
          <select value={anoSelecionado} onChange={e => setAnoSelecionado(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff' }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
            {anos.length === 0 && <option value={anoSelecionado}>{anoSelecionado}</option>}
          </select>
          {/* EXPORTAR */}
          <button onClick={abaAtiva === 'lotes' ? exportarCSVLotes : exportarCSVMensal}
            style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            ⬇️ Exportar CSV
          </button>
          {/* IMPORTAR */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => fileRef.current?.click()}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              ⬆️ Importar histórico
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={importarCSV} style={{ display: 'none' }} />
          </div>
          <button onClick={baixarModelo}
            style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
            📄 Modelo CSV
          </button>
        </div>
      </div>

      {/* RESULTADO IMPORTAÇÃO */}
      {importando && (
        <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#1d4ed8', fontWeight: 600 }}>
          ⏳ Importando dados, aguarde...
        </div>
      )}
      {importResult && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#15803d', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {importResult}
          <button onClick={() => setImportResult(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#15803d', fontSize: 18 }}>✕</button>
        </div>
      )}

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
              {/* CARDS */}
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

              {/* TABELA LOTES */}
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#1a2e0d', color: '#fff' }}>
                      <th style={thL}>Lote</th>
                      <th style={thL}>Período</th>
                      <th style={thL}>Status</th>
                      <th style={{ ...thR }}>Aves</th>
                      <th style={thR}>Entradas</th>
                      <th style={thR}>Saídas</th>
                      <th style={thR}>Resultado</th>
                      <th style={thR}>Custo/Ave</th>
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
                          <td style={tdL}><strong>Lote #{lote.numero}</strong></td>
                          <td style={tdL}>
                            {new Date(lote.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                            {lote.data_fim && ` → ${new Date(lote.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                          </td>
                          <td style={tdL}>
                            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: lote.status === 'em_andamento' ? '#dcfce7' : '#f1f5f9', color: lote.status === 'em_andamento' ? '#15803d' : '#64748b' }}>
                              {lote.status === 'em_andamento' ? '🔄 Andamento' : '✅ Fechado'}
                            </span>
                          </td>
                          <td style={tdR}>{lote.num_aves ? lote.num_aves.toLocaleString() : '-'}</td>
                          <td style={{ ...tdR, color: '#16a34a', fontWeight: 700 }}>{format(entr)}</td>
                          <td style={{ ...tdR, color: '#dc2626', fontWeight: 700 }}>{format(said)}</td>
                          <td style={{ ...tdR, color: resultado >= 0 ? '#16a34a' : '#dc2626', fontWeight: 800 }}>{format(resultado)}</td>
                          <td style={{ ...tdR, color: '#8b5e2a', fontWeight: 600 }}>{custoAve ? format(custoAve) : '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2e0d', color: '#fff', fontWeight: 700 }}>
                      <td style={tdL} colSpan={4}>TOTAL</td>
                      <td style={{ ...tdR, color: '#86efac' }}>{format(lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'entrada'), 0))}</td>
                      <td style={{ ...tdR, color: '#fca5a5' }}>{format(lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'saida'), 0))}</td>
                      <td style={{ ...tdR, color: '#f5c842' }}>{format(lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'entrada') - getMov(l.id, 'saida'), 0))}</td>
                      <td style={tdR}>—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* CATEGORIAS */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>💸 % de Custo por Categoria</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ ...thL, color: '#374151', background: '#f8fafc', minWidth: 160 }}>Categoria</th>
                        {lotesFiltrados.map(l => (
                          <th key={l.id} style={{ ...thR, color: '#374151', background: '#f8fafc', minWidth: 120 }}>Lote #{l.numero}</th>
                        ))}
                        <th style={{ ...thR, color: '#374151', background: '#f8fafc', minWidth: 120 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CATEGORIAS_SAIDA.map((cat, i) => {
                        const totalCat = lotesFiltrados.reduce((a, l) => a + getMov(l.id, 'saida', cat), 0)
                        if (totalCat === 0) return null
                        return (
                          <tr key={cat} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={tdL}>{cat}</td>
                            {lotesFiltrados.map(l => (
                              <td key={l.id} style={tdR}>
                                {getMov(l.id, 'saida', cat) > 0 ? format(getMov(l.id, 'saida', cat)) : '-'}
                              </td>
                            ))}
                            <td style={{ ...tdR, fontWeight: 700, color: '#dc2626' }}>{format(totalCat)}</td>
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
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a2e0d', color: '#fff' }}>
                  <th style={{ ...thL, width: '30%' }}>Mês</th>
                  <th style={thR}>Entradas</th>
                  <th style={thR}>Saídas</th>
                  <th style={thR}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {dadosMensais.map((d, i) => (
                  <tr key={d.mes} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', opacity: d.temDados ? 1 : 0.45 }}>
                    <td style={{ ...tdL, fontWeight: d.temDados ? 700 : 400 }}>{d.mes}</td>
                    <td style={{ ...tdR, color: '#16a34a', fontWeight: d.temDados ? 700 : 400 }}>{format(d.entradas)}</td>
                    <td style={{ ...tdR, color: '#dc2626', fontWeight: d.temDados ? 700 : 400 }}>{format(d.saidas)}</td>
                    <td style={{ ...tdR, color: d.saldo >= 0 ? '#16a34a' : '#dc2626', fontWeight: 800 }}>{format(d.saldo)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#1a2e0d', color: '#fff', fontWeight: 700 }}>
                  <td style={tdL}>TOTAL {anoSelecionado}</td>
                  <td style={{ ...tdR, color: '#86efac' }}>{format(dadosMensais.reduce((a, d) => a + d.entradas, 0))}</td>
                  <td style={{ ...tdR, color: '#fca5a5' }}>{format(dadosMensais.reduce((a, d) => a + d.saidas, 0))}</td>
                  <td style={{ ...tdR, color: '#f5c842' }}>{format(dadosMensais.reduce((a, d) => a + d.saldo, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* CATEGORIAS MENSAL */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>💸 Saídas por Categoria — {anoSelecionado}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ ...thL, color: '#374151', background: '#f8fafc', minWidth: 180 }}>Categoria</th>
                    {dadosMensais.filter(d => d.temDados).map(d => (
                      <th key={d.mes} style={{ ...thR, color: '#374151', background: '#f8fafc', minWidth: 90 }}>{d.mes.slice(0, 3)}</th>
                    ))}
                    <th style={{ ...thR, color: '#374151', background: '#f8fafc', minWidth: 120 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIAS_SAIDA.map((cat, i) => {
                    const mesesComDados = dadosMensais.filter(d => d.temDados)
                    const totalCat = mesesComDados.reduce((a, d) => a + (d.catSaidas[cat] || 0), 0)
                    if (totalCat === 0) return null
                    return (
                      <tr key={cat} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={tdL}>{cat}</td>
                        {mesesComDados.map(d => (
                          <td key={d.mes} style={tdR}>
                            {d.catSaidas[cat] > 0 ? format(d.catSaidas[cat]) : '-'}
                          </td>
                        ))}
                        <td style={{ ...tdR, fontWeight: 700, color: '#dc2626' }}>{format(totalCat)}</td>
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

const thL: React.CSSProperties = { padding: '12px 16px', fontWeight: 700, fontSize: 12, textAlign: 'left', whiteSpace: 'nowrap' }
const thR: React.CSSProperties = { padding: '12px 16px', fontWeight: 700, fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }
const tdL: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'left', whiteSpace: 'nowrap' }
const tdR: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', whiteSpace: 'nowrap' }
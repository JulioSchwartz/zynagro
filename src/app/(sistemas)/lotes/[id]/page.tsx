'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

const CATEGORIAS_ENTRADA = [
  'Pagamento Integradora',
  'Venda Cama/Esterco',
  'Outros Rendimentos',
]

const CATEGORIAS_SAIDA = [
  'Funcionários',
  'Diárias',
  'Maravalha',
  'Pellets',
  'Alimentação/Combustível',
  'Manutenções',
  'Benfeitorias',
  'Adm/Internet',
  'Seguro',
  'Energia',
  'Solar Investimento',
  'Divisão de Sócios',
  'Aplicações',
]

export default function DetalheLote() {
  const { empresaId, loading } = useEmpresa()
  const { id } = useParams()
  const router = useRouter()

  const [lote, setLote] = useState<any>(null)
  const [movimentos, setMovimentos] = useState<any[]>([])
  const [salvando, setSalvando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'entrada' | 'saida'>('entrada')

  // Form
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [documento, setDocumento] = useState('')
  const [historico, setHistorico] = useState('')

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  async function carregar() {
    const [{ data: loteData }, { data: movData }] = await Promise.all([
      supabase.from('lotes').select('*').eq('id', id).eq('empresa_id', empresaId).maybeSingle(),
      supabase.from('lote_movimentos').select('*').eq('lote_id', id).eq('empresa_id', empresaId).order('data', { ascending: false }),
    ])
    setLote(loteData)
    setMovimentos(movData || [])
  }

  async function lancar() {
    if (!categoria) return alert('Selecione uma categoria')
    if (!valor || Number(valor) <= 0) return alert('Informe um valor válido')
    if (!historico.trim()) return alert('Informe o histórico')
    setSalvando(true)
    const { error } = await supabase.from('lote_movimentos').insert({
      lote_id: id,
      empresa_id: empresaId,
      data,
      documento: documento.trim() || null,
      historico: historico.trim(),
      tipo,
      categoria,
      valor: Number(valor),
    })
    if (error) { alert('Erro ao lançar'); setSalvando(false); return }
    setCategoria('')
    setValor('')
    setDocumento('')
    setHistorico('')
    await carregar()
    setSalvando(false)
  }

  async function excluir(movId: string) {
    if (!confirm('Excluir este lançamento?')) return
    await supabase.from('lote_movimentos').delete().eq('id', movId)
    carregar()
  }

  async function fecharLote() {
    if (!confirm('Fechar este lote? Ele será marcado como concluído.')) return
    await supabase.from('lotes').update({ status: 'fechado', conferido_em: new Date().toISOString() }).eq('id', id)
    carregar()
  }

  function format(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading || !lote) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  const entradas = movimentos.filter(m => m.tipo === 'entrada')
  const saidas = movimentos.filter(m => m.tipo === 'saida')
  const totalEntradas = entradas.reduce((a, m) => a + Number(m.valor), 0)
  const totalSaidas = saidas.reduce((a, m) => a + Number(m.valor), 0)
  const saldo = totalEntradas - totalSaidas
  const listaFiltrada = movimentos.filter(m => m.tipo === abaAtiva)

  // Detalhamento por categoria
  const detalhamento = CATEGORIAS_SAIDA.map(cat => {
    const total = saidas.filter(m => m.categoria === cat).reduce((a, m) => a + Number(m.valor), 0)
    return { cat, total }
  }).filter(d => d.total > 0)

  const categorias = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#7ab648', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 8 }}>← Voltar</button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>📦 Lote #{lote.numero}</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>
            {new Date(lote.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
            {lote.data_fim && ` → ${new Date(lote.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
            {lote.num_aves && ` · ${lote.num_aves.toLocaleString()} aves`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {lote.status === 'em_andamento' ? (
            <button onClick={fecharLote}
              style={{ background: '#1a2e0d', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              ✅ Fechar Lote
            </button>
          ) : (
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13 }}>✅ Lote Fechado</span>
          )}
        </div>
      </div>

      {/* CARDS RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #16a34a' }}>
          <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ENTRADAS</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>{format(totalEntradas)}</p>
        </div>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #dc2626' }}>
          <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>SAÍDAS</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>{format(totalSaidas)}</p>
        </div>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${saldo >= 0 ? '#2563eb' : '#dc2626'}` }}>
          <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>SALDO</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: saldo >= 0 ? '#2563eb' : '#dc2626', marginTop: 4 }}>{format(saldo)}</p>
        </div>
        {lote.num_aves && totalSaidas > 0 && (
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #f5c842' }}>
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CUSTO/AVE</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#8b5e2a', marginTop: 4 }}>
              {format(totalSaidas / lote.num_aves)}
            </p>
          </div>
        )}
      </div>

      {/* FORM LANÇAMENTO */}
      {lote.status === 'em_andamento' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>💰 Novo Lançamento</h2>

          {/* Toggle entrada/saída */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setTipo('entrada'); setCategoria('') }}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: '2px solid ' + (tipo === 'entrada' ? '#16a34a' : '#e2e8f0'), background: tipo === 'entrada' ? '#16a34a' : '#f8fafc', color: tipo === 'entrada' ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>
              + Entrada
            </button>
            <button onClick={() => { setTipo('saida'); setCategoria('') }}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: '2px solid ' + (tipo === 'saida' ? '#dc2626' : '#e2e8f0'), background: tipo === 'saida' ? '#dc2626' : '#f8fafc', color: tipo === 'saida' ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>
              − Saída
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelSt}>Data *</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Categoria *</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} style={inputSt}>
                <option value="">Selecionar...</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Valor *</label>
              <input type="number" value={valor} onChange={e => setValor(e.target.value)}
                placeholder="0,00" step="0.01" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Documento</label>
              <input value={documento} onChange={e => setDocumento(e.target.value)}
                placeholder="NF, recibo..." style={inputSt} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Histórico *</label>
            <input value={historico} onChange={e => setHistorico(e.target.value)}
              placeholder="Descreva o lançamento..." style={{ ...inputSt, width: '100%', boxSizing: 'border-box' as const }} />
          </div>
          <button onClick={lancar} disabled={salvando}
            style={{ background: tipo === 'entrada' ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {salvando ? 'Salvando...' : '✓ Lançar'}
          </button>
        </div>
      )}

      {/* DETALHAMENTO POR CATEGORIA */}
      {detalhamento.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>📊 Detalhamento de Saídas</h2>
          {detalhamento.map(d => (
            <div key={d.cat} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{d.cat}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {format(d.total)} · {totalSaidas > 0 ? ((d.total / totalSaidas) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${totalSaidas > 0 ? (d.total / totalSaidas) * 100 : 0}%`, background: '#7ab648', borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXTRATO */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {(['entrada', 'saida'] as const).map(t => (
            <button key={t} onClick={() => setAbaAtiva(t)}
              style={{ flex: 1, padding: '14px', border: 'none', background: abaAtiva === t ? '#fff' : '#f8fafc', borderBottom: abaAtiva === t ? `3px solid ${t === 'entrada' ? '#16a34a' : '#dc2626'}` : 'none', color: abaAtiva === t ? (t === 'entrada' ? '#16a34a' : '#dc2626') : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {t === 'entrada' ? `Entradas (${entradas.length})` : `Saídas (${saidas.length})`}
            </button>
          ))}
        </div>

        {listaFiltrada.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Nenhum lançamento ainda.</p>
        )}

        {listaFiltrada.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', borderLeft: `4px solid ${m.tipo === 'entrada' ? '#16a34a' : '#dc2626'}` }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{m.historico}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {m.categoria} · {new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                {m.documento && ` · ${m.documento}`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <strong style={{ color: m.tipo === 'entrada' ? '#16a34a' : '#dc2626', fontSize: 15 }}>
                {m.tipo === 'entrada' ? '+' : '-'} {format(Number(m.valor))}
              </strong>
              <button onClick={() => excluir(m.id)}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff' }
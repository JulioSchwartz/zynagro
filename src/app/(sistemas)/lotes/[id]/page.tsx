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
  'Funcionários', 'Diárias', 'Maravalha', 'Pellets',
  'Alimentação/Combustível', 'Manutenções', 'Benfeitorias',
  'Adm/Internet', 'Seguro', 'Energia', 'Solar Investimento',
  'Divisão de Sócios', 'Aplicações',
]

export default function DetalheLote() {
  const { empresaId, loading } = useEmpresa()
  const { id } = useParams()
  const router = useRouter()

  const [lote, setLote] = useState<any>(null)
  const [movimentos, setMovimentos] = useState<any[]>([])
  const [diarios, setDiarios] = useState<any[]>([])
  const [pesagens, setPesagens] = useState<any[]>([])
  const [salvando, setSalvando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'financeiro' | 'diario' | 'pesagem'>('financeiro')
  const [abaFinanceiro, setAbaFinanceiro] = useState<'entrada' | 'saida'>('entrada')

  // Form financeiro
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0])
  const [documento, setDocumento] = useState('')
  const [historico, setHistorico] = useState('')

  // Form diário
  const [diarioData, setDiarioData] = useState(new Date().toISOString().split('T')[0])
  const [diarioGalpoes, setDiarioGalpoes] = useState<any[]>([])
  const [salvandoDiario, setSalvandoDiario] = useState(false)
  const [mostrarFormDiario, setMostrarFormDiario] = useState(false)

  // Form pesagem
  const [pesagemData, setPesagemData] = useState(new Date().toISOString().split('T')[0])
  const [pesagemGalpoes, setPesagemGalpoes] = useState<any[]>([])
  const [salvandoPesagem, setSalvandoPesagem] = useState(false)
  const [mostrarFormPesagem, setMostrarFormPesagem] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  useEffect(() => {
    if (lote) {
      const n = lote.num_galpoes || 4
      setDiarioGalpoes(Array.from({ length: n }, (_, i) => ({
        numero: i + 1, mortalidade: '', consumo_racao: '', temp_min: '', temp_max: ''
      })))
      setPesagemGalpoes(Array.from({ length: n }, (_, i) => ({
        numero: i + 1, peso_medio: '', num_amostras: ''
      })))
    }
  }, [lote])

  async function carregar() {
    const [{ data: loteData }, { data: movData }, { data: diarioData }, { data: pesagemData }] = await Promise.all([
      supabase.from('lotes').select('*').eq('id', id).eq('empresa_id', empresaId).maybeSingle(),
      supabase.from('lote_movimentos').select('*').eq('lote_id', id).eq('empresa_id', empresaId).order('data', { ascending: false }),
      supabase.from('lote_diario_galpao').select('*').eq('lote_id', id).eq('empresa_id', empresaId).order('data', { ascending: false }),
      supabase.from('lote_pesagem').select('*').eq('lote_id', id).eq('empresa_id', empresaId).order('data', { ascending: false }),
    ])
    setLote(loteData)
    setMovimentos(movData || [])
    setDiarios(diarioData || [])
    setPesagens(pesagemData || [])
  }

  async function lancar() {
    if (!categoria) return alert('Selecione uma categoria')
    if (!valor || Number(valor) <= 0) return alert('Informe um valor válido')
    if (!historico.trim()) return alert('Informe o histórico')
    setSalvando(true)
    const { error } = await supabase.from('lote_movimentos').insert({
      lote_id: id, empresa_id: empresaId,
      data: dataLanc, documento: documento.trim() || null,
      historico: historico.trim(), tipo, categoria,
      valor: Number(valor),
    })
    if (error) { alert('Erro ao lançar'); setSalvando(false); return }
    setCategoria(''); setValor(''); setDocumento(''); setHistorico('')
    await carregar()
    setSalvando(false)
  }

  async function excluirMov(movId: string) {
    if (!confirm('Excluir este lançamento?')) return
    await supabase.from('lote_movimentos').delete().eq('id', movId)
    carregar()
  }

  async function salvarDiario() {
    const temDado = diarioGalpoes.some(g => g.mortalidade || g.consumo_racao || g.temp_min || g.temp_max)
    if (!temDado) return alert('Informe pelo menos um dado para registrar')

    setSalvandoDiario(true)
    const inicio = new Date(lote.data_inicio + 'T12:00:00')
    const dataAtual = new Date(diarioData + 'T12:00:00')
    const diaLote = Math.floor((dataAtual.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Verifica se já existe registro para essa data e galpão
    await supabase.from('lote_diario_galpao').delete()
      .eq('lote_id', id).eq('data', diarioData)

    for (const g of diarioGalpoes) {
      if (!g.mortalidade && !g.consumo_racao && !g.temp_min && !g.temp_max) continue
      await supabase.from('lote_diario_galpao').insert({
        lote_id: id, empresa_id: empresaId,
        data: diarioData, dia_lote: diaLote,
        galpao_numero: g.numero,
        mortalidade: Number(g.mortalidade) || 0,
        consumo_racao: g.consumo_racao ? Number(g.consumo_racao) : null,
        temperatura_min: g.temp_min ? Number(g.temp_min) : null,
        temperatura_max: g.temp_max ? Number(g.temp_max) : null,
      })
    }

    setMostrarFormDiario(false)
    await carregar()
    setSalvandoDiario(false)
  }

  async function salvarPesagem() {
    const temDado = pesagemGalpoes.some(g => g.peso_medio)
    if (!temDado) return alert('Informe o peso médio de pelo menos um galpão')

    setSalvandoPesagem(true)
    const inicio = new Date(lote.data_inicio + 'T12:00:00')
    const dataAtual = new Date(pesagemData + 'T12:00:00')
    const diaLote = Math.floor((dataAtual.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

    await supabase.from('lote_pesagem').delete()
      .eq('lote_id', id).eq('data', pesagemData)

    for (const g of pesagemGalpoes) {
      if (!g.peso_medio) continue
      await supabase.from('lote_pesagem').insert({
        lote_id: id, empresa_id: empresaId,
        data: pesagemData, dia_lote: diaLote,
        galpao_numero: g.numero,
        peso_medio: Number(g.peso_medio),
        num_amostras: g.num_amostras ? Number(g.num_amostras) : null,
      })
    }

    setMostrarFormPesagem(false)
    await carregar()
    setSalvandoPesagem(false)
  }

  async function fecharLote() {
    if (!confirm('Fechar este lote? Ele será marcado como concluído.')) return
    await supabase.from('lotes').update({ status: 'fechado', conferido_em: new Date().toISOString() }).eq('id', id)
    carregar()
  }

  function format(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function atualizarDiarioGalpao(idx: number, campo: string, valor: string) {
    setDiarioGalpoes(prev => prev.map((g, i) => i === idx ? { ...g, [campo]: valor } : g))
  }

  function atualizarPesagemGalpao(idx: number, campo: string, valor: string) {
    setPesagemGalpoes(prev => prev.map((g, i) => i === idx ? { ...g, [campo]: valor } : g))
  }

  if (loading || !lote) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  const entradas = movimentos.filter(m => m.tipo === 'entrada')
  const saidas = movimentos.filter(m => m.tipo === 'saida')
  const totalEntradas = entradas.reduce((a, m) => a + Number(m.valor), 0)
  const totalSaidas = saidas.reduce((a, m) => a + Number(m.valor), 0)
  const saldo = totalEntradas - totalSaidas
  const listaFiltrada = movimentos.filter(m => m.tipo === abaFinanceiro)
  const categorias = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA

  // Mortalidade acumulada por galpão
  const mortalidadeAcum: Record<number, number> = {}
  const numGalpoes = lote.num_galpoes || 4
  for (let g = 1; g <= numGalpoes; g++) {
    mortalidadeAcum[g] = diarios.filter(d => d.galpao_numero === g).reduce((a, d) => a + (d.mortalidade || 0), 0)
  }
  const mortalidadeTotalAcum = Object.values(mortalidadeAcum).reduce((a, v) => a + v, 0)
  const avesVivas = lote.num_aves ? lote.num_aves - mortalidadeTotalAcum : null
  const percMortalidade = lote.num_aves ? ((mortalidadeTotalAcum / lote.num_aves) * 100).toFixed(2) : null

  // Dias únicos no diário
  const diasDiario = Array.from(new Set(diarios.map(d => d.data))).sort().reverse()

  // Dias únicos na pesagem
  const diasPesagem = Array.from(new Set(pesagens.map(d => d.data))).sort().reverse()

  // Dia atual do lote
  const hoje = new Date()
  const inicio = new Date(lote.data_inicio + 'T12:00:00')
  const diaAtualLote = Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const detalhamento = CATEGORIAS_SAIDA.map(cat => {
    const total = saidas.filter(m => m.categoria === cat).reduce((a, m) => a + Number(m.valor), 0)
    return { cat, total }
  }).filter(d => d.total > 0)

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
            {lote.num_galpoes && ` · ${lote.num_galpoes} galpão(ões)`}
          </p>
          {lote.status === 'em_andamento' && (
            <p style={{ fontSize: 13, color: '#f5c842', fontWeight: 700, marginTop: 4 }}>
              📅 Dia {diaAtualLote} do lote
              {lote.tecnico_integradora && ` · Técnico: ${lote.tecnico_integradora}`}
            </p>
          )}
        </div>
       <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => router.push(`/lotes/${id}/editar`)}
            style={{ background: '#f5c842', color: '#1a2e0d', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            ✏️ Editar
          </button>
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

      {/* CARDS RESUMO FINANCEIRO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={cardStyle('#16a34a')}>
          <p style={cardLabel}>ENTRADAS</p>
          <p style={{ ...cardValor, color: '#16a34a' }}>{format(totalEntradas)}</p>
        </div>
        <div style={cardStyle('#dc2626')}>
          <p style={cardLabel}>SAÍDAS</p>
          <p style={{ ...cardValor, color: '#dc2626' }}>{format(totalSaidas)}</p>
        </div>
        <div style={cardStyle(saldo >= 0 ? '#2563eb' : '#dc2626')}>
          <p style={cardLabel}>SALDO</p>
          <p style={{ ...cardValor, color: saldo >= 0 ? '#2563eb' : '#dc2626' }}>{format(saldo)}</p>
        </div>
        {lote.num_aves && totalSaidas > 0 && (
          <div style={cardStyle('#f5c842')}>
            <p style={cardLabel}>CUSTO/AVE</p>
            <p style={{ ...cardValor, color: '#8b5e2a' }}>{format(totalSaidas / lote.num_aves)}</p>
          </div>
        )}
        {avesVivas !== null && (
          <div style={cardStyle('#7ab648')}>
            <p style={cardLabel}>AVES VIVAS</p>
            <p style={{ ...cardValor, color: '#2d6a1a' }}>{avesVivas.toLocaleString()}</p>
          </div>
        )}
        {percMortalidade !== null && (
          <div style={cardStyle(Number(percMortalidade) > 3 ? '#dc2626' : '#94a3b8')}>
            <p style={cardLabel}>MORTALIDADE</p>
            <p style={{ ...cardValor, color: Number(percMortalidade) > 3 ? '#dc2626' : '#374151' }}>{percMortalidade}%</p>
          </div>
        )}
      </div>

      {/* ABAS PRINCIPAIS */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
        {[
          { key: 'financeiro', label: '💰 Financeiro' },
          { key: 'diario', label: '📔 Diário' },
          { key: 'pesagem', label: '⚖️ Pesagem' },
        ].map(aba => (
          <button key={aba.key} onClick={() => setAbaAtiva(aba.key as any)}
            style={{ padding: '12px 20px', border: 'none', background: 'transparent', fontWeight: 700, fontSize: 14, cursor: 'pointer', borderBottom: abaAtiva === aba.key ? '3px solid #2d6a1a' : '3px solid transparent', color: abaAtiva === aba.key ? '#2d6a1a' : '#94a3b8', marginBottom: -2 }}>
            {aba.label}
          </button>
        ))}
      </div>

      {/* ABA FINANCEIRO */}
      {abaAtiva === 'financeiro' && (
        <div>
          {lote.status === 'em_andamento' && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>💰 Novo Lançamento</h2>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button onClick={() => { setTipo('entrada'); setCategoria('') }}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${tipo === 'entrada' ? '#16a34a' : '#e2e8f0'}`, background: tipo === 'entrada' ? '#16a34a' : '#f8fafc', color: tipo === 'entrada' ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                  + Entrada
                </button>
                <button onClick={() => { setTipo('saida'); setCategoria('') }}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${tipo === 'saida' ? '#dc2626' : '#e2e8f0'}`, background: tipo === 'saida' ? '#dc2626' : '#f8fafc', color: tipo === 'saida' ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                  − Saída
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelSt}>Data *</label>
                  <input type="date" value={dataLanc} onChange={e => setDataLanc(e.target.value)} style={inputSt} />
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
                  <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" step="0.01" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Documento</label>
                  <input value={documento} onChange={e => setDocumento(e.target.value)} placeholder="NF, recibo..." style={inputSt} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Histórico *</label>
                <input value={historico} onChange={e => setHistorico(e.target.value)}
                  placeholder="Descreva o lançamento..."
                  style={{ ...inputSt, width: '100%', boxSizing: 'border-box' as const }} />
              </div>
              <button onClick={lancar} disabled={salvando}
                style={{ background: tipo === 'entrada' ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                {salvando ? 'Salvando...' : '✓ Lançar'}
              </button>
            </div>
          )}

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

          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
              {(['entrada', 'saida'] as const).map(t => (
                <button key={t} onClick={() => setAbaFinanceiro(t)}
                  style={{ flex: 1, padding: '14px', border: 'none', background: abaFinanceiro === t ? '#fff' : '#f8fafc', borderBottom: abaFinanceiro === t ? `3px solid ${t === 'entrada' ? '#16a34a' : '#dc2626'}` : 'none', color: abaFinanceiro === t ? (t === 'entrada' ? '#16a34a' : '#dc2626') : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  {t === 'entrada' ? `Entradas (${entradas.length})` : `Saídas (${saidas.length})`}
                </button>
              ))}
            </div>
            {listaFiltrada.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Nenhum lançamento ainda.</p>}
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
                  <button onClick={() => excluirMov(m.id)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA DIÁRIO */}
      {abaAtiva === 'diario' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', margin: 0 }}>📔 Diário do Lote</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Mortalidade e consumo de ração por galpão</p>
            </div>
            {lote.status === 'em_andamento' && (
              <button onClick={() => setMostrarFormDiario(!mostrarFormDiario)}
                style={{ background: mostrarFormDiario ? '#64748b' : '#2d6a1a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {mostrarFormDiario ? '✕ Cancelar' : '+ Registrar Dia'}
              </button>
            )}
          </div>

          {/* RESUMO MORTALIDADE */}
          {mortalidadeTotalAcum > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e0d', marginBottom: 14 }}>💀 Mortalidade Acumulada</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                {Array.from({ length: numGalpoes }, (_, i) => i + 1).map(g => (
                  <div key={g} style={{ background: '#f8fafc', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Galpão {g}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: mortalidadeAcum[g] > 0 ? '#dc2626' : '#94a3b8', marginTop: 4 }}>
                      {mortalidadeAcum[g] || 0}
                    </p>
                    <p style={{ fontSize: 10, color: '#94a3b8' }}>aves</p>
                  </div>
                ))}
                <div style={{ background: '#fee2e2', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid #fca5a5' }}>
                  <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>TOTAL</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>{mortalidadeTotalAcum}</p>
                  {percMortalidade && <p style={{ fontSize: 10, color: '#dc2626', fontWeight: 700 }}>{percMortalidade}%</p>}
                </div>
              </div>
            </div>
          )}

          {/* FORM DIÁRIO */}
          {mostrarFormDiario && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2e0d', margin: 0 }}>Registrar Dia</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <label style={labelSt}>Data *</label>
                    <input type="date" value={diarioData} onChange={e => setDiarioData(e.target.value)} style={{ ...inputSt, width: 160 }} />
                  </div>
                  {diarioData && (
                    <p style={{ fontSize: 12, color: '#7ab648', fontWeight: 700, marginTop: 20 }}>
                      Dia {Math.floor((new Date(diarioData + 'T12:00:00').getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1} do lote
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {diarioGalpoes.map((g, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 700, color: '#1a2e0d', marginBottom: 10, fontSize: 13 }}>🏗️ Galpão {g.numero}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                      <div>
                        <label style={labelSt}>Mortalidade (aves)</label>
                        <input type="number" value={g.mortalidade} onChange={e => atualizarDiarioGalpao(idx, 'mortalidade', e.target.value)}
                          placeholder="0" min="0" style={inputSt} />
                      </div>
                      <div>
                        <label style={labelSt}>Consumo Ração (kg)</label>
                        <input type="number" value={g.consumo_racao} onChange={e => atualizarDiarioGalpao(idx, 'consumo_racao', e.target.value)}
                          placeholder="0" step="0.1" style={inputSt} />
                      </div>
                      <div>
                        <label style={labelSt}>Temp. Mín (°C)</label>
                        <input type="number" value={g.temp_min} onChange={e => atualizarDiarioGalpao(idx, 'temp_min', e.target.value)}
                          placeholder="0" step="0.1" style={inputSt} />
                      </div>
                      <div>
                        <label style={labelSt}>Temp. Máx (°C)</label>
                        <input type="number" value={g.temp_max} onChange={e => atualizarDiarioGalpao(idx, 'temp_max', e.target.value)}
                          placeholder="0" step="0.1" style={inputSt} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={salvarDiario} disabled={salvandoDiario}
                style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                {salvandoDiario ? 'Salvando...' : '✓ Salvar Registros do Dia'}
              </button>
            </div>
          )}

          {/* HISTÓRICO DIÁRIO */}
          {diasDiario.length === 0 ? (
            <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 16, padding: 30, textAlign: 'center' }}>
              <p style={{ color: '#16a34a', fontWeight: 600 }}>Nenhum registro no diário ainda</p>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Clique em "+ Registrar Dia" para começar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {diasDiario.map(data => {
                const registros = diarios.filter(d => d.data === data)
                const diaLote = registros[0]?.dia_lote
                const mortDia = registros.reduce((a, d) => a + (d.mortalidade || 0), 0)
                const racaoDia = registros.reduce((a, d) => a + (Number(d.consumo_racao) || 0), 0)
                return (
                  <div key={data} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <p style={{ fontWeight: 700, color: '#1a2e0d', fontSize: 15 }}>
                          {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        {diaLote && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>Dia {diaLote}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {mortDia > 0 && <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 700 }}>💀 {mortDia} mortes</span>}
                        {racaoDia > 0 && <span style={{ fontSize: 13, color: '#7ab648', fontWeight: 700 }}>🌾 {racaoDia.toFixed(0)} kg ração</span>}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                      {registros.map(r => (
                        <div key={r.id} style={{ background: '#f8fafc', borderRadius: 8, padding: 10, border: '1px solid #e2e8f0' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0d', marginBottom: 6 }}>Galpão {r.galpao_numero}</p>
                          {r.mortalidade > 0 && <p style={{ fontSize: 12, color: '#dc2626' }}>💀 {r.mortalidade} mortes</p>}
                          {r.consumo_racao && <p style={{ fontSize: 12, color: '#7ab648' }}>🌾 {Number(r.consumo_racao).toFixed(0)} kg</p>}
                          {r.temperatura_min && r.temperatura_max && <p style={{ fontSize: 12, color: '#64748b' }}>🌡️ {r.temperatura_min}°C ~ {r.temperatura_max}°C</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA PESAGEM */}
      {abaAtiva === 'pesagem' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', margin: 0 }}>⚖️ Pesagem Semanal</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Peso médio por amostragem por galpão</p>
            </div>
            {lote.status === 'em_andamento' && (
              <button onClick={() => setMostrarFormPesagem(!mostrarFormPesagem)}
                style={{ background: mostrarFormPesagem ? '#64748b' : '#2d6a1a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {mostrarFormPesagem ? '✕ Cancelar' : '+ Registrar Pesagem'}
              </button>
            )}
          </div>

          {/* FORM PESAGEM */}
          {mostrarFormPesagem && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelSt}>Data da Pesagem *</label>
                  <input type="date" value={pesagemData} onChange={e => setPesagemData(e.target.value)} style={{ ...inputSt, width: 160 }} />
                </div>
                {pesagemData && (
                  <p style={{ fontSize: 12, color: '#7ab648', fontWeight: 700, marginTop: 20 }}>
                    Dia {Math.floor((new Date(pesagemData + 'T12:00:00').getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1} do lote
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {pesagemGalpoes.map((g, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 700, color: '#1a2e0d', marginBottom: 10, fontSize: 13 }}>🏗️ Galpão {g.numero}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                      <div>
                        <label style={labelSt}>Peso Médio (g) *</label>
                        <input type="number" value={g.peso_medio} onChange={e => atualizarPesagemGalpao(idx, 'peso_medio', e.target.value)}
                          placeholder="Ex: 850" step="1" style={inputSt} />
                      </div>
                      <div>
                        <label style={labelSt}>Nº de Amostras</label>
                        <input type="number" value={g.num_amostras} onChange={e => atualizarPesagemGalpao(idx, 'num_amostras', e.target.value)}
                          placeholder="Ex: 100" style={inputSt} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={salvarPesagem} disabled={salvandoPesagem}
                style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                {salvandoPesagem ? 'Salvando...' : '✓ Salvar Pesagem'}
              </button>
            </div>
          )}

          {/* HISTÓRICO PESAGEM */}
          {diasPesagem.length === 0 ? (
            <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 16, padding: 30, textAlign: 'center' }}>
              <p style={{ color: '#16a34a', fontWeight: 600 }}>Nenhuma pesagem registrada ainda</p>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Registre a pesagem semanal para acompanhar o desenvolvimento das aves</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {diasPesagem.map(data => {
                const regs = pesagens.filter(p => p.data === data)
                const diaLote = regs[0]?.dia_lote
                const pesoMedioGeral = regs.length > 0 ? regs.reduce((a, r) => a + Number(r.peso_medio), 0) / regs.length : 0
                return (
                  <div key={data} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <p style={{ fontWeight: 700, color: '#1a2e0d', fontSize: 15 }}>
                          {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        {diaLote && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>Dia {diaLote}</span>}
                      </div>
                      <span style={{ fontSize: 13, color: '#2d6a1a', fontWeight: 700 }}>
                        ⚖️ Média geral: {pesoMedioGeral.toFixed(0)}g
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                      {regs.map(r => (
                        <div key={r.id} style={{ background: '#f8fafc', borderRadius: 8, padding: 10, border: '1px solid #e2e8f0' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0d', marginBottom: 6 }}>Galpão {r.galpao_numero}</p>
                          <p style={{ fontSize: 16, fontWeight: 800, color: '#2d6a1a' }}>{Number(r.peso_medio).toFixed(0)}g</p>
                          {r.num_amostras && <p style={{ fontSize: 11, color: '#94a3b8' }}>{r.num_amostras} amostras</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, background: '#fff' }
const cardStyle = (cor: string): React.CSSProperties => ({ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${cor}` })
const cardLabel: React.CSSProperties = { fontSize: 11, color: '#64748b', fontWeight: 600 }
const cardValor: React.CSSProperties = { fontSize: 20, fontWeight: 800, marginTop: 4 }
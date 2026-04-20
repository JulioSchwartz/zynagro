'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

const DURACOES = [
  { label: '28 dias (padrão BRF)', valor: 28 },
  { label: '35 dias', valor: 35 },
  { label: '42 dias', valor: 42 },
  { label: '45 dias', valor: 45 },
  { label: 'Personalizado', valor: 0 },
]

export default function Lotes() {
  const { empresaId, loading } = useEmpresa()
  const router = useRouter()
  const [lotes, setLotes] = useState<any[]>([])
  const [granjas, setGranjas] = useState<any[]>([])
  const [movimentos, setMovimentos] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Form
  const [granjaId, setGranjaId] = useState('')
  const [numero, setNumero] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [numAves, setNumAves] = useState('')
  const [numGalpoes, setNumGalpoes] = useState('4')
  const [duracaoOpcao, setDuracaoOpcao] = useState(28)
  const [duracaoCustom, setDuracaoCustom] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [pesoEntrada, setPesoEntrada] = useState('')

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  // Quando selecionar granja, preenche num_galpoes automaticamente
  useEffect(() => {
    if (granjaId) {
      const granja = granjas.find(g => g.id === granjaId)
      if (granja?.num_galpoes) setNumGalpoes(String(granja.num_galpoes))
    }
  }, [granjaId, granjas])

  async function carregar() {
    const [{ data: lotesData }, { data: granjasData }, { data: movData }] = await Promise.all([
      supabase.from('lotes').select('*').eq('empresa_id', empresaId).order('criado_em', { ascending: false }),
      supabase.from('granjas').select('*').eq('empresa_id', empresaId),
      supabase.from('lote_movimentos').select('*').eq('empresa_id', empresaId),
    ])
    setLotes(lotesData || [])
    setGranjas(granjasData || [])
    setMovimentos(movData || [])
  }

  async function criarLote() {
    if (!numero) return alert('Informe o número do lote')
    if (!dataInicio) return alert('Informe a data de início')
    if (!numGalpoes || Number(numGalpoes) < 1) return alert('Informe o número de galpões')

    const duracao = duracaoOpcao === 0 ? Number(duracaoCustom) : duracaoOpcao
    if (!duracao || duracao < 1) return alert('Informe a duração do lote')

    setSalvando(true)
    const dataFim = new Date(dataInicio)
    dataFim.setDate(dataFim.getDate() + duracao)

    const { error } = await supabase.from('lotes').insert({
      empresa_id: empresaId,
      granja_id: granjaId || null,
      numero: Number(numero),
      data_inicio: dataInicio,
      data_fim: dataFim.toISOString().split('T')[0],
      num_aves: numAves ? Number(numAves) : null,
      num_galpoes: Number(numGalpoes),
      duracao_dias: duracao,
      peso_entrada: pesoEntrada ? Number(pesoEntrada) : null,
      tecnico_integradora: tecnico.trim() || null,
      status: 'em_andamento',
    })

    if (error) { alert('Erro ao criar lote'); setSalvando(false); return }

    setMostrarForm(false)
    setNumero(''); setNumAves(''); setGranjaId('')
    setNumGalpoes('4'); setDuracaoOpcao(28)
    setDuracaoCustom(''); setTecnico(''); setPesoEntrada('')
    await carregar()
    setSalvando(false)
  }

  function format(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>📦 Lotes</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Gerencie os lotes da granja</p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          style={{ background: mostrarForm ? '#64748b' : '#2d6a1a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          {mostrarForm ? '✕ Cancelar' : '+ Novo Lote'}
        </button>
      </div>

      {/* FORM NOVO LOTE */}
      {mostrarForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 20 }}>+ Novo Lote</h2>

          <p style={secaoTitulo}>📋 Dados Básicos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelSt}>Número do Lote *</label>
              <input type="number" value={numero} onChange={e => setNumero(e.target.value)}
                placeholder="Ex: 1" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Data de Início *</label>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Granja</label>
              <select value={granjaId} onChange={e => setGranjaId(e.target.value)} style={inputSt}>
                <option value="">Selecionar...</option>
                {granjas.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Nº de Galpões *</label>
              <input type="number" value={numGalpoes} onChange={e => setNumGalpoes(e.target.value)}
                min="1" max="20" style={inputSt} />
            </div>
          </div>

          <p style={secaoTitulo}>⏱️ Duração do Lote</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: duracaoOpcao === 0 ? 10 : 20 }}>
            {DURACOES.map(op => (
              <button key={op.valor} onClick={() => setDuracaoOpcao(op.valor)}
                style={{ padding: '10px', borderRadius: 8, border: `2px solid ${duracaoOpcao === op.valor ? '#2d6a1a' : '#e2e8f0'}`, background: duracaoOpcao === op.valor ? '#2d6a1a' : '#f8fafc', color: duracaoOpcao === op.valor ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {op.label}
              </button>
            ))}
          </div>
          {duracaoOpcao === 0 && (
            <div style={{ marginBottom: 20, maxWidth: 200 }}>
              <label style={labelSt}>Duração em dias *</label>
              <input type="number" value={duracaoCustom} onChange={e => setDuracaoCustom(e.target.value)}
                placeholder="Ex: 30" min="1" style={inputSt} />
            </div>
          )}
          {dataInicio && (duracaoOpcao > 0 || duracaoCustom) && (
            <p style={{ fontSize: 12, color: '#7ab648', fontWeight: 600, marginBottom: 20 }}>
              📅 Data de fim prevista: {(() => {
                const d = new Date(dataInicio)
                d.setDate(d.getDate() + (duracaoOpcao || Number(duracaoCustom)))
                return d.toLocaleDateString('pt-BR')
              })()}
            </p>
          )}

          <p style={secaoTitulo}>🐔 Informações das Aves</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelSt}>Total de Aves</label>
              <input type="number" value={numAves} onChange={e => setNumAves(e.target.value)}
                placeholder="Ex: 120000" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Peso de Entrada (g)</label>
              <input type="number" value={pesoEntrada} onChange={e => setPesoEntrada(e.target.value)}
                placeholder="Ex: 42" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Técnico da Integradora</label>
              <input value={tecnico} onChange={e => setTecnico(e.target.value)}
                placeholder="Nome do técnico" style={inputSt} />
            </div>
          </div>

          <button onClick={criarLote} disabled={salvando}
            style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {salvando ? 'Criando...' : '+ Criar Lote'}
          </button>
        </div>
      )}

      {/* LISTA DE LOTES */}
      {lotes.length === 0 ? (
        <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 16 }}>Nenhum lote cadastrado ainda</p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Clique em "+ Novo Lote" para começar</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lotes.map(lote => {
            const entr = movimentos.filter(m => m.lote_id === lote.id && m.tipo === 'entrada').reduce((a, m) => a + Number(m.valor), 0)
            const said = movimentos.filter(m => m.lote_id === lote.id && m.tipo === 'saida').reduce((a, m) => a + Number(m.valor), 0)
            const saldo = entr - said
            const granja = granjas.find(g => g.id === lote.granja_id)

            // Dias restantes
            const hoje = new Date()
            const fim = lote.data_fim ? new Date(lote.data_fim + 'T12:00:00') : null
            const inicio = new Date(lote.data_inicio + 'T12:00:00')
            const diaLote = Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
            const diasRestantes = fim ? Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null

            return (
              <div key={lote.id} onClick={() => router.push(`/lotes/${lote.id}`)}
                style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', borderLeft: `4px solid ${lote.status === 'em_andamento' ? '#7ab648' : '#94a3b8'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Lote #{lote.numero}</p>
                      <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 999, background: lote.status === 'em_andamento' ? '#dcfce7' : '#f1f5f9', color: lote.status === 'em_andamento' ? '#15803d' : '#64748b', fontWeight: 700 }}>
                        {lote.status === 'em_andamento' ? '🔄 Em andamento' : '✅ Fechado'}
                      </span>
                      {lote.status === 'em_andamento' && diaLote > 0 && (
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                          Dia {diaLote} do lote
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      {new Date(lote.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                      {lote.data_fim && ` → ${new Date(lote.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                      {granja && ` · ${granja.nome}`}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      {lote.num_aves && <p style={{ fontSize: 12, color: '#94a3b8' }}>🐔 {lote.num_aves.toLocaleString()} aves</p>}
                      {lote.num_galpoes && <p style={{ fontSize: 12, color: '#94a3b8' }}>🏗️ {lote.num_galpoes} galpão(ões)</p>}
                      {lote.status === 'em_andamento' && diasRestantes !== null && (
                        <p style={{ fontSize: 12, color: diasRestantes < 5 ? '#dc2626' : '#94a3b8', fontWeight: diasRestantes < 5 ? 700 : 400 }}>
                          {diasRestantes > 0 ? `⏳ ${diasRestantes} dias restantes` : '⚠️ Prazo encerrado'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Entradas: <span style={{ color: '#16a34a', fontWeight: 600 }}>{format(entr)}</span></p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Saídas: <span style={{ color: '#dc2626', fontWeight: 600 }}>{format(said)}</span></p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: saldo >= 0 ? '#16a34a' : '#dc2626', marginTop: 4 }}>Saldo: {format(saldo)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, background: '#fff' }
const secaoTitulo: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#1a2e0d', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }
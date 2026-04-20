'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

const DURACOES = [
  { label: '28 dias (padrão BRF)', valor: 28 },
  { label: '35 dias', valor: 35 },
  { label: '42 dias', valor: 42 },
  { label: '45 dias', valor: 45 },
  { label: 'Personalizado', valor: 0 },
]

export default function EditarLote() {
  const { empresaId, loading } = useEmpresa()
  const { id } = useParams()
  const router = useRouter()
  const [granjas, setGranjas] = useState<any[]>([])
  const [salvando, setSalvando] = useState(false)

  const [granjaId, setGranjaId] = useState('')
  const [numero, setNumero] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [numAves, setNumAves] = useState('')
  const [numGalpoes, setNumGalpoes] = useState('4')
  const [duracaoOpcao, setDuracaoOpcao] = useState(28)
  const [duracaoCustom, setDuracaoCustom] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [pesoEntrada, setPesoEntrada] = useState('')
  const [obs, setObs] = useState('')

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  async function carregar() {
    const [{ data: lote }, { data: granjasData }] = await Promise.all([
      supabase.from('lotes').select('*').eq('id', id).eq('empresa_id', empresaId).maybeSingle(),
      supabase.from('granjas').select('*').eq('empresa_id', empresaId),
    ])
    if (!lote) { router.push('/lotes'); return }
    setGranjas(granjasData || [])
    setNumero(String(lote.numero || ''))
    setDataInicio(lote.data_inicio || '')
    setNumAves(lote.num_aves ? String(lote.num_aves) : '')
    setNumGalpoes(String(lote.num_galpoes || 4))
    setTecnico(lote.tecnico_integradora || '')
    setPesoEntrada(lote.peso_entrada ? String(lote.peso_entrada) : '')
    setObs(lote.obs || '')
    setGranjaId(lote.granja_id || '')

    // Detecta duração
    const dur = lote.duracao_dias || 28
    const opcao = DURACOES.find(d => d.valor === dur && d.valor !== 0)
    if (opcao) { setDuracaoOpcao(dur) }
    else { setDuracaoOpcao(0); setDuracaoCustom(String(dur)) }
  }

  async function salvar() {
    if (!numero) return alert('Informe o número do lote')
    if (!dataInicio) return alert('Informe a data de início')
    const duracao = duracaoOpcao === 0 ? Number(duracaoCustom) : duracaoOpcao
    if (!duracao || duracao < 1) return alert('Informe a duração do lote')

    setSalvando(true)
    const dataFim = new Date(dataInicio)
    dataFim.setDate(dataFim.getDate() + duracao)

    const { error } = await supabase.from('lotes').update({
      granja_id: granjaId || null,
      numero: Number(numero),
      data_inicio: dataInicio,
      data_fim: dataFim.toISOString().split('T')[0],
      num_aves: numAves ? Number(numAves) : null,
      num_galpoes: Number(numGalpoes),
      duracao_dias: duracao,
      peso_entrada: pesoEntrada ? Number(pesoEntrada) : null,
      tecnico_integradora: tecnico.trim() || null,
      obs: obs.trim() || null,
    }).eq('id', id).eq('empresa_id', empresaId)

    if (error) { alert('Erro ao salvar'); setSalvando(false); return }
    router.push(`/lotes/${id}`)
  }

  if (loading) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  return (
    <div>
      <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#7ab648', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 16 }}>← Voltar</button>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', marginBottom: 24 }}>✏️ Editar Lote #{numero}</h1>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        <p style={secaoTitulo}>📋 Dados Básicos</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelSt}>Número do Lote *</label>
            <input type="number" value={numero} onChange={e => setNumero(e.target.value)} style={inputSt} />
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
            <input type="number" value={numGalpoes} onChange={e => setNumGalpoes(e.target.value)} min="1" max="20" style={inputSt} />
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
            <input type="number" value={duracaoCustom} onChange={e => setDuracaoCustom(e.target.value)} placeholder="Ex: 30" min="1" style={inputSt} />
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
            <input type="number" value={numAves} onChange={e => setNumAves(e.target.value)} placeholder="Ex: 120000" style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Peso de Entrada (g)</label>
            <input type="number" value={pesoEntrada} onChange={e => setPesoEntrada(e.target.value)} placeholder="Ex: 42" style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Técnico da Integradora</label>
            <input value={tecnico} onChange={e => setTecnico(e.target.value)} placeholder="Nome do técnico" style={inputSt} />
          </div>
        </div>

        <p style={secaoTitulo}>📝 Observações</p>
        <textarea value={obs} onChange={e => setObs(e.target.value)}
          placeholder="Observações sobre o lote..."
          rows={3} style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit', marginBottom: 20 }} />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={salvar} disabled={salvando}
            style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {salvando ? 'Salvando...' : '✓ Salvar Alterações'}
          </button>
          <button onClick={() => router.back()}
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, background: '#fff' }
const secaoTitulo: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#1a2e0d', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }
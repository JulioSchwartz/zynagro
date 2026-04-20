'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

const VENTILACAO_OPCOES = ['Convencional', 'Dark House', 'Semi Dark House', 'Climatizado']
const INTEGRADORAS = ['BRF', 'Aurora', 'Copacol', 'Globoaves', 'Frangosul', 'Seara', 'Outra']

export default function Granjas() {
  const { empresaId, loading } = useEmpresa()
  const router = useRouter()
  const [granjas, setGranjas] = useState<any[]>([])
  const [galpoes, setGalpoes] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [granjaExpandida, setGranjaExpandida] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  // Form granja
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('PR')
  const [responsavel, setResponsavel] = useState('')
  const [telefone, setTelefone] = useState('')
  const [integradora, setIntegradora] = useState('')
  const [numGalpoes, setNumGalpoes] = useState('4')
  const [observacoes, setObservacoes] = useState('')

  // Galpões do form
  const [formGalpoes, setFormGalpoes] = useState<any[]>([])

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  useEffect(() => {
    const n = Number(numGalpoes) || 1
    setFormGalpoes(prev => {
      const novos = Array.from({ length: n }, (_, i) => ({
        numero: i + 1,
        largura: prev[i]?.largura || '26',
        comprimento: prev[i]?.comprimento || '150',
        capacidade: prev[i]?.capacidade || '',
        ventilacao: prev[i]?.ventilacao || 'Convencional',
      }))
      return novos
    })
  }, [numGalpoes])

  async function carregar() {
    const [{ data: granjasData }, { data: galpoesData }] = await Promise.all([
      supabase.from('granjas').select('*').eq('empresa_id', empresaId).order('criado_em', { ascending: true }),
      supabase.from('galpoes').select('*').eq('empresa_id', empresaId).order('numero', { ascending: true }),
    ])
    setGranjas(granjasData || [])
    setGalpoes(galpoesData || [])
  }

  async function salvar() {
    if (!nome.trim()) return alert('Informe o nome da granja')
    setSalvando(true)

    let granjaId = editandoId

    if (editandoId) {
      await supabase.from('granjas').update({
        nome: nome.trim(), endereco, cidade, estado,
        responsavel, telefone, integradora,
        num_galpoes: Number(numGalpoes), observacoes,
      }).eq('id', editandoId)
      await supabase.from('galpoes').delete().eq('granja_id', editandoId)
    } else {
      const { data } = await supabase.from('granjas').insert({
        empresa_id: empresaId,
        nome: nome.trim(), endereco, cidade, estado,
        responsavel, telefone, integradora,
        num_galpoes: Number(numGalpoes), observacoes,
      }).select().single()
      granjaId = data?.id
    }

    // Salva galpões
    if (granjaId) {
      for (const g of formGalpoes) {
        await supabase.from('galpoes').insert({
          granja_id: granjaId,
          empresa_id: empresaId,
          numero: g.numero,
          largura: Number(g.largura) || null,
          comprimento: Number(g.comprimento) || null,
          capacidade: Number(g.capacidade) || null,
          ventilacao: g.ventilacao,
        })
      }
    }

    cancelar()
    await carregar()
    setSalvando(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta granja e todos os seus galpões?')) return
    await supabase.from('galpoes').delete().eq('granja_id', id)
    await supabase.from('granjas').delete().eq('id', id)
    carregar()
  }

  function editar(granja: any) {
    setEditandoId(granja.id)
    setNome(granja.nome || '')
    setEndereco(granja.endereco || '')
    setCidade(granja.cidade || '')
    setEstado(granja.estado || 'PR')
    setResponsavel(granja.responsavel || '')
    setTelefone(granja.telefone || '')
    setIntegradora(granja.integradora || '')
    setNumGalpoes(String(granja.num_galpoes || 4))
    setObservacoes(granja.observacoes || '')
    const galpoesGranja = galpoes.filter(g => g.granja_id === granja.id)
    setFormGalpoes(galpoesGranja.map(g => ({
      numero: g.numero,
      largura: String(g.largura || 26),
      comprimento: String(g.comprimento || 150),
      capacidade: String(g.capacidade || ''),
      ventilacao: g.ventilacao || 'Convencional',
    })))
    setMostrarForm(true)
  }

  function cancelar() {
    setEditandoId(null)
    setNome(''); setEndereco(''); setCidade(''); setEstado('PR')
    setResponsavel(''); setTelefone(''); setIntegradora('')
    setNumGalpoes('4'); setObservacoes(''); setFormGalpoes([])
    setMostrarForm(false)
  }

  function atualizarGalpao(idx: number, campo: string, valor: string) {
    setFormGalpoes(prev => prev.map((g, i) => i === idx ? { ...g, [campo]: valor } : g))
  }

  if (loading) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>🐔 Granjas</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Gerencie suas granjas e galpões</p>
        </div>
        <button onClick={() => mostrarForm ? cancelar() : setMostrarForm(true)}
          style={{ background: mostrarForm ? '#64748b' : '#2d6a1a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          {mostrarForm ? '✕ Cancelar' : '+ Nova Granja'}
        </button>
      </div>

      {/* FORM */}
      {mostrarForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 20 }}>
            {editandoId ? '✏️ Editar Granja' : '+ Nova Granja'}
          </h2>

          {/* DADOS GERAIS */}
          <p style={secaoTitulo}>📋 Dados Gerais</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelSt}>Nome da Granja *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Granja Boa Vista" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Integradora / Cooperativa</label>
              <select value={integradora} onChange={e => setIntegradora(e.target.value)} style={inputSt}>
                <option value="">Selecionar...</option>
                {INTEGRADORAS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Número de Galpões</label>
              <input type="number" value={numGalpoes} onChange={e => setNumGalpoes(e.target.value)} min="1" max="20" style={inputSt} />
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
          <p style={secaoTitulo}>📍 Localização</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelSt}>Endereço</label>
              <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rodovia, linha, sítio..." style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Cidade</label>
              <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Castro" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)} style={inputSt}>
                {['PR','SC','RS','SP','MG','GO','MT','MS','BA','outros'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* RESPONSÁVEL */}
          <p style={secaoTitulo}>👤 Responsável</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelSt}>Nome do Responsável</label>
              <input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Nome completo" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Telefone</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(42) 99999-9999" style={inputSt} />
            </div>
          </div>

          {/* GALPÕES */}
          <p style={secaoTitulo}>🏗️ Configuração dos Galpões</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {formGalpoes.map((g, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 700, color: '#1a2e0d', marginBottom: 10, fontSize: 13 }}>Galpão {g.numero}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <div>
                    <label style={labelSt}>Largura (m)</label>
                    <input type="number" value={g.largura} onChange={e => atualizarGalpao(idx, 'largura', e.target.value)} placeholder="26" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Comprimento (m)</label>
                    <input type="number" value={g.comprimento} onChange={e => atualizarGalpao(idx, 'comprimento', e.target.value)} placeholder="150" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Capacidade (aves)</label>
                    <input type="number" value={g.capacidade} onChange={e => atualizarGalpao(idx, 'capacidade', e.target.value)} placeholder="50000" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Ventilação</label>
                    <select value={g.ventilacao} onChange={e => atualizarGalpao(idx, 'ventilacao', e.target.value)} style={inputSt}>
                      {VENTILACAO_OPCOES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Área total</label>
                    <input readOnly value={g.largura && g.comprimento ? `${(Number(g.largura) * Number(g.comprimento)).toLocaleString()} m²` : '-'}
                      style={{ ...inputSt, background: '#f1f5f9', color: '#64748b' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* OBSERVAÇÕES */}
          <p style={secaoTitulo}>📝 Observações</p>
          <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)}
            placeholder="Informações adicionais sobre a granja..."
            rows={3} style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit', marginBottom: 20 }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={salvar} disabled={salvando}
              style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              {salvando ? 'Salvando...' : editandoId ? '✓ Salvar Alterações' : '+ Criar Granja'}
            </button>
            <button onClick={cancelar}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      {granjas.length === 0 ? (
        <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🐔</p>
          <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 16 }}>Nenhuma granja cadastrada ainda</p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Clique em "+ Nova Granja" para começar</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {granjas.map(granja => {
            const galpoesGranja = galpoes.filter(g => g.granja_id === granja.id)
            const expandida = granjaExpandida === granja.id
            const capTotal = galpoesGranja.reduce((a, g) => a + (Number(g.capacidade) || 0), 0)
            return (
              <div key={granja.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '4px solid #7ab648', overflow: 'hidden' }}>
                {/* HEADER */}
                <div style={{ padding: 24, cursor: 'pointer' }} onClick={() => setGranjaExpandida(expandida ? null : granja.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 800, fontSize: 20, color: '#1a2e0d' }}>{granja.nome}</p>
                        {granja.integradora && (
                          <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>
                            {granja.integradora}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                        {granja.cidade && <p style={{ color: '#64748b', fontSize: 13 }}>📍 {granja.cidade}{granja.estado ? `/${granja.estado}` : ''}</p>}
                        {granja.responsavel && <p style={{ color: '#64748b', fontSize: 13 }}>👤 {granja.responsavel}</p>}
                        {granja.telefone && <p style={{ color: '#64748b', fontSize: 13 }}>📞 {granja.telefone}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                        <p style={{ color: '#94a3b8', fontSize: 12 }}>🏗️ {granja.num_galpoes} galpão(ões)</p>
                        {capTotal > 0 && <p style={{ color: '#94a3b8', fontSize: 12 }}>🐔 {capTotal.toLocaleString()} aves (capacidade total)</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={e => { e.stopPropagation(); editar(granja) }}
                        style={{ background: '#f5c842', color: '#1a2e0d', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                        ✏️ Editar
                      </button>
                      <button onClick={e => { e.stopPropagation(); excluir(granja.id) }}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                        ✕
                      </button>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{expandida ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* GALPÕES EXPANDIDO */}
                {expandida && galpoesGranja.length > 0 && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: 24, background: '#f8fafc' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Detalhes dos Galpões</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {galpoesGranja.map(g => (
                        <div key={g.id} style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                          <p style={{ fontWeight: 700, color: '#1a2e0d', marginBottom: 8 }}>Galpão {g.numero}</p>
                          {g.largura && g.comprimento && (
                            <p style={{ fontSize: 12, color: '#64748b' }}>📐 {g.largura}m × {g.comprimento}m = {(g.largura * g.comprimento).toLocaleString()}m²</p>
                          )}
                          {g.capacidade && (
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>🐔 {Number(g.capacidade).toLocaleString()} aves</p>
                          )}
                          {g.ventilacao && (
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>💨 {g.ventilacao}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {granja.observacoes && (
                      <div style={{ marginTop: 14, background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>OBSERVAÇÕES</p>
                        <p style={{ fontSize: 13, color: '#374151' }}>{granja.observacoes}</p>
                      </div>
                    )}
                  </div>
                )}
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
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

export default function Granjas() {
  const { empresaId, loading } = useEmpresa()
  const router = useRouter()
  const [granjas, setGranjas] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Form
  const [nome, setNome] = useState('')
  const [numGalpoes, setNumGalpoes] = useState('4')
  const [editandoId, setEditandoId] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  async function carregar() {
    const { data } = await supabase
      .from('granjas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('criado_em', { ascending: true })
    setGranjas(data || [])
  }

  async function salvar() {
    if (!nome.trim()) return alert('Informe o nome da granja')
    setSalvando(true)
    if (editandoId) {
      await supabase.from('granjas').update({
        nome: nome.trim(),
        num_galpoes: Number(numGalpoes),
      }).eq('id', editandoId)
    } else {
      await supabase.from('granjas').insert({
        empresa_id: empresaId,
        nome: nome.trim(),
        num_galpoes: Number(numGalpoes),
      })
    }
    setNome('')
    setNumGalpoes('4')
    setEditandoId(null)
    setMostrarForm(false)
    await carregar()
    setSalvando(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta granja?')) return
    await supabase.from('granjas').delete().eq('id', id)
    carregar()
  }

  function editar(granja: any) {
    setEditandoId(granja.id)
    setNome(granja.nome)
    setNumGalpoes(String(granja.num_galpoes || 4))
    setMostrarForm(true)
  }

  function cancelar() {
    setEditandoId(null)
    setNome('')
    setNumGalpoes('4')
    setMostrarForm(false)
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
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>
            {editandoId ? '✏️ Editar Granja' : '+ Nova Granja'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelSt}>Nome da Granja *</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Granja Boa Vista" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Número de Galpões</label>
              <input type="number" value={numGalpoes} onChange={e => setNumGalpoes(e.target.value)}
                min="1" max="20" style={inputSt} />
            </div>
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {granjas.map(granja => (
            <div key={granja.id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '4px solid #7ab648' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 18, color: '#1a2e0d' }}>{granja.nome}</p>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    🏗️ {granja.num_galpoes || 4} galpão(ões)
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                    Cadastrada em {new Date(granja.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => editar(granja)}
                    style={{ background: '#f5c842', color: '#1a2e0d', border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => excluir(granja.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* INDICADOR DE GALPÕES */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                {Array.from({ length: granja.num_galpoes || 4 }).map((_, i) => (
                  <div key={i} style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#15803d' }}>
                    Galpão {i + 1}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, background: '#fff' }
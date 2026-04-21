'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

export default function Dashboard() {
  const { empresaId, loading } = useEmpresa()
  const router = useRouter()
  const [lotes, setLotes] = useState<any[]>([])
  const [movimentos, setMovimentos] = useState<any[]>([])
  const [diarios, setDiarios] = useState<any[]>([])

  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }
    carregar()
  }, [empresaId, loading])

  async function carregar() {
    const [{ data: lotesData }, { data: movData }, { data: diariosData }] = await Promise.all([
      supabase.from('lotes').select('*').eq('empresa_id', empresaId).order('criado_em', { ascending: false }),
      supabase.from('lote_movimentos').select('*').eq('empresa_id', empresaId),
      supabase.from('lote_diario_galpao').select('*').eq('empresa_id', empresaId),
    ])
    setLotes(lotesData || [])
    setMovimentos(movData || [])
    setDiarios(diariosData || [])
  }

  const loteAtivo = lotes.find(l => l.status === 'em_andamento')
  const totalLotes = lotes.length
  const totalEntradas = movimentos.filter(m => m.tipo === 'entrada').reduce((a, m) => a + Number(m.valor), 0)
  const totalSaidas = movimentos.filter(m => m.tipo === 'saida').reduce((a, m) => a + Number(m.valor), 0)
  const saldoGeral = totalEntradas - totalSaidas

  // Mortalidade do lote ativo
  const mortalidadeLoteAtivo = loteAtivo
    ? diarios.filter(d => d.lote_id === loteAtivo.id).reduce((a, d) => a + (d.mortalidade || 0), 0)
    : 0
  const percMortAtivo = loteAtivo?.num_aves
    ? Number(((mortalidadeLoteAtivo / loteAtivo.num_aves) * 100).toFixed(2))
    : null
  const alertaMortalidade = percMortAtivo !== null && percMortAtivo > 3

  function format(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) return <p style={{ color: '#7ab648', textAlign: 'center', marginTop: 40 }}>Carregando...</p>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>🏠 Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Visão geral da granja</p>
      </div>

      {/* ALERTA MORTALIDADE */}
      {alertaMortalidade && (
        <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <p style={{ color: '#dc2626', fontWeight: 800, fontSize: 15, margin: 0 }}>
                Alerta: Mortalidade acima do limite no Lote #{loteAtivo?.numero}!
              </p>
              <p style={{ color: '#991b1b', fontSize: 13, margin: '2px 0 0' }}>
                Mortalidade atual: <strong>{percMortAtivo}%</strong> (limite: 3%) · {mortalidadeLoteAtivo.toLocaleString()} aves perdidas
              </p>
            </div>
          </div>
          <button onClick={() => router.push(`/lotes/${loteAtivo?.id}`)}
            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            Ver lote →
          </button>
        </div>
      )}

      {/* CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card titulo="Total de Lotes" valor={totalLotes} cor="#1a2e0d" tipo="numero" />
        <Card titulo="Total Entradas" valor={totalEntradas} cor="#16a34a" tipo="moeda" />
        <Card titulo="Total Saídas" valor={totalSaidas} cor="#dc2626" tipo="moeda" />
        <Card titulo="Saldo Geral" valor={saldoGeral} cor={saldoGeral >= 0 ? '#2563eb' : '#dc2626'} tipo="moeda" />
      </div>

      {/* LOTE ATIVO */}
      {loteAtivo ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>📦 Lote em Andamento</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>Lote #{loteAtivo.numero}</p>
              <p style={{ color: '#64748b', fontSize: 13 }}>
                Início: {new Date(loteAtivo.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                {loteAtivo.data_fim && ` · Fim previsto: ${new Date(loteAtivo.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
              </p>
              {loteAtivo.num_aves && <p style={{ color: '#64748b', fontSize: 13 }}>{loteAtivo.num_aves.toLocaleString()} aves</p>}
            </div>
            <button onClick={() => router.push(`/lotes/${loteAtivo.id}`)}
              style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              Ver Lote →
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 20 }}>
          <p style={{ color: '#16a34a', fontWeight: 600 }}>Nenhum lote em andamento</p>
          <button onClick={() => router.push('/lotes')}
            style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>
            + Criar Novo Lote
          </button>
        </div>
      )}

      {/* ÚLTIMOS LOTES */}
      {lotes.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e0d', marginBottom: 16 }}>📋 Últimos Lotes</h2>
          {lotes.slice(0, 5).map(lote => {
            const entr = movimentos.filter(m => m.lote_id === lote.id && m.tipo === 'entrada').reduce((a, m) => a + Number(m.valor), 0)
            const said = movimentos.filter(m => m.lote_id === lote.id && m.tipo === 'saida').reduce((a, m) => a + Number(m.valor), 0)
            const saldo = entr - said
            return (
              <div key={lote.id} onClick={() => router.push(`/lotes/${lote.id}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#0f172a' }}>Lote #{lote.numero}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{new Date(lote.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: saldo >= 0 ? '#16a34a' : '#dc2626' }}>{format(saldo)}</p>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: lote.status === 'em_andamento' ? '#dbeafe' : '#dcfce7', color: lote.status === 'em_andamento' ? '#1d4ed8' : '#15803d', fontWeight: 600 }}>
                    {lote.status === 'em_andamento' ? 'Em andamento' : 'Fechado'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Card({ titulo, valor, cor, tipo }: any) {
  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${cor}` }}>
      <p style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>{titulo}</p>
      <h2 style={{ color: cor, fontSize: 22, fontWeight: 800, marginTop: 6 }}>
        {tipo === 'moeda'
          ? Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : valor}
      </h2>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEmpresa } from '@/hooks/useEmpresa'

const VENTILACAO_OPCOES = ['Convencional', 'Dark House', 'Semi Dark House', 'Climatizado']
const INTEGRADORAS = ['BRF', 'Aurora', 'Copacol', 'Globoaves', 'Frangosul', 'Seara', 'Outra']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function Setup() {
  const { empresaId, loading } = useEmpresa()
  const router = useRouter()
  const [etapa, setEtapa] = useState<'verificando' | 'form' | 'salvando'>('verificando')

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
  const [formGalpoes, setFormGalpoes] = useState<any[]>([])
  const [erro, setErro] = useState('')

  // Inicializa galpões ao carregar
  useEffect(() => {
    setFormGalpoes(Array.from({ length: 4 }, (_, i) => ({
      numero: i + 1, largura: '26', comprimento: '150', capacidade: '', ventilacao: 'Convencional',
    })))
  }, [])

  // Atualiza lista de galpões quando muda quantidade
  useEffect(() => {
    const n = Number(numGalpoes) || 1
    setFormGalpoes(prev => Array.from({ length: n }, (_, i) => ({
      numero: i + 1,
      largura: prev[i]?.largura || '26',
      comprimento: prev[i]?.comprimento || '150',
      capacidade: prev[i]?.capacidade || '',
      ventilacao: prev[i]?.ventilacao || 'Convencional',
    })))
  }, [numGalpoes])

  // Verifica se já tem granja — se tiver, manda pro dashboard
  useEffect(() => {
    if (loading) return
    if (!empresaId) { router.push('/auth/login'); return }

    supabase.from('granjas').select('id').eq('empresa_id', empresaId).limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        router.push('/dashboard')
      } else {
        setEtapa('form')
      }
    })
  }, [empresaId, loading])

  function atualizarGalpao(idx: number, campo: string, valor: string) {
    setFormGalpoes(prev => prev.map((g, i) => i === idx ? { ...g, [campo]: valor } : g))
  }

  async function salvar() {
    setErro('')
    if (!nome.trim()) { setErro('Informe o nome da granja.'); return }
    if (!integradora) { setErro('Selecione a integradora.'); return }

    setEtapa('salvando')

    // Cria a granja
    const { data: granja, error: erroGranja } = await supabase.from('granjas').insert({
      empresa_id: empresaId,
      nome: nome.trim(),
      endereco: endereco.trim(),
      cidade: cidade.trim(),
      estado,
      responsavel: responsavel.trim(),
      telefone: telefone.trim(),
      integradora,
      num_galpoes: Number(numGalpoes),
      observacoes: observacoes.trim(),
    }).select().single()

    if (erroGranja || !granja) {
      setErro('Erro ao criar a granja. Tente novamente.')
      setEtapa('form')
      return
    }

    // Cria os galpões
    for (const g of formGalpoes) {
      await supabase.from('galpoes').insert({
        granja_id: granja.id,
        empresa_id: empresaId,
        numero: g.numero,
        largura: Number(g.largura) || null,
        comprimento: Number(g.comprimento) || null,
        capacidade: Number(g.capacidade) || null,
        ventilacao: g.ventilacao,
      })
    }

    router.push('/dashboard')
  }

  if (etapa === 'verificando') {
    return (
      <div style={{ minHeight: '100vh', background: '#1a2e0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7ab648', fontWeight: 700, fontSize: 16 }}>Carregando...</p>
      </div>
    )
  }

  if (etapa === 'salvando') {
    return (
      <div style={{ minHeight: '100vh', background: '#1a2e0d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 48 }}>🌾</span>
        <p style={{ color: '#7ab648', fontWeight: 700, fontSize: 18 }}>Configurando sua granja...</p>
        <p style={{ color: '#475569', fontSize: 14 }}>Só um momento!</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a2e0d' }}>

      {/* TOPBAR simples */}
      <div style={{ background: '#0f1f07', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', borderBottom: '1px solid #2d4a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#f5c842', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a2e0d', fontSize: 16, fontWeight: 900 }}>Z</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>zynagro</span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Boas-vindas */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 52 }}>🐔</span>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: '16px 0 8px' }}>
            Bem-vindo ao Zynagro!
          </h1>
          <p style={{ color: '#7ab648', fontSize: 16, margin: '0 0 6px' }}>
            Antes de começar, vamos cadastrar sua granja e configurar os galpões.
          </p>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Leva menos de 2 minutos e você não vai precisar repetir isso.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>

          {/* DADOS DA GRANJA */}
          <p style={secaoTitulo}>🏡 Dados da Granja</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelSt}>Nome da granja <span style={{ color: '#dc2626' }}>*</span></label>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Granja Boa Vista" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Integradora <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={integradora} onChange={e => setIntegradora(e.target.value)} style={inputSt}>
                <option value="">Selecione...</option>
                {INTEGRADORAS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Responsável</label>
              <input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Nome completo" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Telefone</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(42) 99999-9999" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Cidade</label>
              <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Castro" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)} style={inputSt}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelSt}>Endereço</label>
              <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Estrada Municipal, km 12..." style={inputSt} />
            </div>
          </div>

          {/* GALPÕES */}
          <p style={secaoTitulo}>🏗️ Configuração dos Galpões</p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Quantos galpões sua granja tem?</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['1', '2', '3', '4', '5', '6', '8'].map(n => (
                <button key={n} onClick={() => setNumGalpoes(n)}
                  style={{
                    padding: '8px 18px', borderRadius: 8, border: '2px solid',
                    borderColor: numGalpoes === n ? '#2d6a1a' : '#e2e8f0',
                    background: numGalpoes === n ? '#2d6a1a' : '#f8fafc',
                    color: numGalpoes === n ? '#fff' : '#64748b',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}>
                  {n}
                </button>
              ))}
              <input
                type="number" min="1" max="20"
                value={!['1','2','3','4','5','6','8'].includes(numGalpoes) ? numGalpoes : ''}
                onChange={e => e.target.value && setNumGalpoes(e.target.value)}
                placeholder="outro"
                style={{ ...inputSt, width: 80, padding: '8px 12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {formGalpoes.map((g, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 700, color: '#1a2e0d', marginBottom: 12, fontSize: 14 }}>
                  🏗️ Galpão {g.numero}
                </p>
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
                  <div>
                    <label style={labelSt}>Área total</label>
                    <input readOnly
                      value={g.largura && g.comprimento ? `${(Number(g.largura) * Number(g.comprimento)).toLocaleString()} m²` : '—'}
                      style={{ ...inputSt, background: '#f1f5f9', color: '#94a3b8' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* OBSERVAÇÕES */}
          <p style={secaoTitulo}>📝 Observações <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 11 }}>(opcional)</span></p>
          <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)}
            placeholder="Informações adicionais sobre a granja..."
            rows={3} style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit', marginBottom: 24 }} />

          {erro && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
              {erro}
            </div>
          )}

          <button onClick={salvar}
            style={{ width: '100%', background: '#2d6a1a', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(45,106,26,0.3)' }}>
            Salvar e entrar no sistema →
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
            Você pode editar essas informações depois em <strong>Granjas</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, background: '#fff' }
const secaoTitulo: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#1a2e0d', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #f0fdf4', textTransform: 'uppercase' as const, letterSpacing: 1 }
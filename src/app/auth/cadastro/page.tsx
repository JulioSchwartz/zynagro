'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Cadastro() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [nomeGranja, setNomeGranja] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function cadastrar() {
    setErro('')
    if (!nome.trim() || !nomeGranja.trim() || !email.trim() || !senha || !confirma) {
      setErro('Preencha todos os campos.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (senha !== confirma) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha, nomeEmpresa: nomeGranja, nomeUsuario: nome }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error || 'Erro ao criar conta. Tente novamente.')
        setLoading(false)
        return
      }

      // Loga automaticamente após cadastro
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (loginErr) {
        setSucesso(true) // Cadastro ok mas login falhou — exibe mensagem
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setErro('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a2e0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <span style={{ fontSize: 56 }}>🎉</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2e0d', margin: '16px 0 8px' }}>Conta criada!</h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
            Verifique seu e-mail para confirmar o cadastro e depois faça login.
          </p>
          <a href="/auth/login" style={{ display: 'inline-block', marginTop: 24, background: '#2d6a1a', color: '#fff', padding: '12px 32px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            Ir para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a2e0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1a2e0d', borderRadius: 14, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <span style={{ color: '#f5c842', fontSize: 28, fontWeight: 900 }}>Z</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e0d', margin: 0 }}>zynagro</h1>
            <p style={{ color: '#7ab648', fontSize: 12, marginTop: 4, letterSpacing: 2 }}>GESTÃO DO CAMPO</p>
          </a>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2e0d', textAlign: 'center', marginBottom: 4 }}>Criar conta grátis</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 24 }}>14 dias grátis · Sem cartão</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelSt}>Seu nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="João Silva" style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Nome da granja</label>
            <input type="text" value={nomeGranja} onChange={e => setNomeGranja(e.target.value)} placeholder="Granja Boa Vista" style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Confirmar senha</label>
            <input type="password" value={confirma} onChange={e => setConfirma(e.target.value)} placeholder="Repita a senha" onKeyDown={e => e.key === 'Enter' && cadastrar()} style={inputSt} />
          </div>

          {erro && <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', background: '#fef2f2', padding: '8px 12px', borderRadius: 8 }}>{erro}</p>}

          <button onClick={cadastrar} disabled={loading}
            style={{ background: '#2d6a1a', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Criando conta...' : 'Criar conta grátis →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          Já tem conta?{' '}
          <a href="/auth/login" style={{ color: '#2d6a1a', fontWeight: 700, textDecoration: 'none' }}>Entrar</a>
        </p>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 16 }}>
          parte do ecossistema Zyncompany
        </p>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputSt: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, outline: 'none' }
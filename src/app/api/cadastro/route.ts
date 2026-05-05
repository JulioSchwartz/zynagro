import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  try {
    const { email, password, nomeEmpresa, nomeUsuario } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: false,
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'Este email já está cadastrado. Faça login.' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const user = authData.user
    if (!user) {
      return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 })
    }

    const { data: empresa, error: erroEmpresa } = await supabaseAdmin
      .from('empresas')
      .insert({
        nome: nomeEmpresa?.trim() || email,
        plano: 'basico',
        status: 'trial',
        criado_em: new Date().toISOString(),
      })
      .select().single()

    if (erroEmpresa || !empresa) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Erro ao criar empresa.' }, { status: 500 })
    }

    const { error: erroUsuario } = await supabaseAdmin
      .from('usuarios')
      .insert({
        email, user_id: user.id, empresa_id: empresa.id,
        perfil: 'admin', criado_em: new Date().toISOString(),
      })

    if (erroUsuario) {
      await supabaseAdmin.from('empresas').delete().eq('id', empresa.id)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Erro ao vincular usuário.' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY!)

    // Email de boas-vindas para o usuário
    try {
      await resend.emails.send({
        from: 'Zynagro <noreply@zyncompany.com.br>',
        to: [email],
        subject: `Bem-vindo à Zynagro, ${nomeEmpresa || ''}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1a2e0d; color: #fff; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 28px;">
              <div style="background: #f5c842; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #1a2e0d; font-size: 22px; font-weight: 900;">Z</span>
              </div>
              <div>
                <span style="color: #fff; font-size: 18px; font-weight: 800;">zynagro</span><br/>
                <span style="color: #7ab648; font-size: 11px; letter-spacing: 2px;">GESTÃO DO CAMPO</span>
              </div>
            </div>
            <h2 style="color: #f5c842; margin-bottom: 8px;">Bem-vindo à Zynagro! 🌾</h2>
            <p style="color: #94a3b8; margin-bottom: 24px;">Sua conta foi criada com sucesso. Explore a plataforma e comece a gerenciar sua granja com mais controle.</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px; width: 140px;">Granja</td><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600;">${nomeEmpresa || '—'}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px;">E-mail</td><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600;">${email}</td></tr>
              <tr><td style="padding: 12px 0; color: #7ab648; font-size: 13px;">Plano</td><td style="padding: 12px 0; font-weight: 600;">Trial (14 dias grátis)</td></tr>
            </table>
            <a href="https://zynagro.vercel.app/login"
               style="display: inline-block; background: #f5c842; color: #1a2e0d; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">
              Acessar minha conta →
            </a>
            <p style="color: #475569; font-size: 13px; margin-top: 32px;">Qualquer dúvida, fale com a gente em <a href="https://zyncompany.com.br/contato" style="color: #7ab648;">zyncompany.com.br/contato</a>.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Erro ao enviar boas-vindas:', emailErr)
    }

    // Notificação interna
    try {
      await resend.emails.send({
        from: 'Zynagro <noreply@zyncompany.com.br>',
        to: ['suportezynagro@gmail.com'],
        subject: `🌾 Novo cadastro Zynagro: ${nomeEmpresa || email}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1a2e0d; color: #fff; border-radius: 12px;">
            <h2 style="color: #f5c842; margin-bottom: 24px;">🌾 Novo cadastro na Zynagro!</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px; width: 140px;">Nome</td><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600;">${nomeUsuario || '—'}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px;">Granja</td><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600;">${nomeEmpresa || '—'}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px;">E-mail</td><td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600;">${email}</td></tr>
              <tr><td style="padding: 12px 0; color: #7ab648; font-size: 13px;">Data/hora</td><td style="padding: 12px 0; font-weight: 600;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td></tr>
            </table>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Erro ao enviar notificação:', emailErr)
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Erro cadastro Zynagro:', err)
    return NextResponse.json({ error: 'Erro inesperado. Tente novamente.' }, { status: 500 })
  }
}
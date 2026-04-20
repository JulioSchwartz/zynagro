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

    // 1. Cria o usuário no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
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

    // 2. Cria a empresa (granja)
    const { data: empresa, error: erroEmpresa } = await supabaseAdmin
      .from('empresas')
      .insert({
        nome: nomeEmpresa?.trim() || email,
        plano: 'basico',
        status: 'trial',
        criado_em: new Date().toISOString(),
      })
      .select()
      .single()

    if (erroEmpresa || !empresa) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Erro ao criar empresa.' }, { status: 500 })
    }

    // 3. Cria o registro na tabela usuarios
    const { error: erroUsuario } = await supabaseAdmin
      .from('usuarios')
      .insert({
        email,
        user_id: user.id,
        empresa_id: empresa.id,
        perfil: 'admin',
        criado_em: new Date().toISOString(),
      })

    if (erroUsuario) {
      await supabaseAdmin.from('empresas').delete().eq('id', empresa.id)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Erro ao vincular usuário.' }, { status: 500 })
    }

    // 4. Notifica você (Júlio) sobre o novo cadastro
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!)
      await resend.emails.send({
        from: 'Zynagro <noreply@zynplan.com.br>',
        to: ['j.ulioschwartz@hotmail.com'],
        subject: `🌾 Novo cadastro Zynagro: ${nomeEmpresa || email}`,
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

            <h2 style="color: #f5c842; margin-bottom: 24px; font-size: 20px;">🌾 Novo cadastro na Zynagro!</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; width: 140px; font-size: 13px;">Nome</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600; font-size: 14px;">${nomeUsuario || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px;">Granja</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600; font-size: 14px;">${nomeEmpresa || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px;">E-mail</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600; font-size: 14px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; color: #7ab648; font-size: 13px;">Plano</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #2d4a1a; font-weight: 600; font-size: 14px;">Trial (14 dias grátis)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #7ab648; font-size: 13px;">Data/hora</td>
                <td style="padding: 12px 0; font-weight: 600; font-size: 14px;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
              </tr>
            </table>

            <div style="margin-top: 28px; background: rgba(122,182,72,0.15); border: 1px solid rgba(122,182,72,0.3); border-radius: 10px; padding: 14px 18px;">
              <p style="margin: 0; color: #7ab648; font-size: 13px;">💡 Entre em contato para dar boas-vindas e garantir uma boa experiência!</p>
            </div>

            <p style="margin-top: 32px; color: #475569; font-size: 11px; text-align: center;">
              Zynagro · parte do ecossistema Zyncompany
            </p>
          </div>
        `,
      })
    } catch (emailErr) {
      // Não falha o cadastro se o email de notificação falhar
      console.error('Erro ao enviar notificação de cadastro:', emailErr)
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Erro cadastro Zynagro:', err)
    return NextResponse.json({ error: 'Erro inesperado. Tente novamente.' }, { status: 500 })
  }
}
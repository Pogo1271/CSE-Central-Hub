import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      // Redirect back to app with error
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=${error}`)
    }
    
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=no_code`)
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
      }),
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=token_exchange_failed`)
    }
    
    const tokenData = await tokenResponse.json()
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=user_info_failed`)
    }
    
    const userInfo = await userResponse.json()
    
    // Redirect back to the app with tokens and user info
    const redirectUrl = new URL(process.env.NEXTAUTH_URL!)
    redirectUrl.searchParams.append('google_access_token', tokenData.access_token)
    redirectUrl.searchParams.append('google_refresh_token', tokenData.refresh_token || '')
    redirectUrl.searchParams.append('google_email', userInfo.email)
    redirectUrl.searchParams.append('google_name', userInfo.name)
    
    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=callback_error`)
  }
}
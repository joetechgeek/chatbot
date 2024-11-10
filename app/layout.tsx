import { GeistSans } from 'geist/font'
import "./globals.css"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import SupabaseAuthProvider from '@/components/providers/SupabaseAuthProvider'

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return (
      <html lang="en" className={GeistSans.className}>
        <body>
          <SupabaseProvider>
            <SupabaseAuthProvider serverSession={session}>
              <main className="min-h-screen">
                {children}
              </main>
            </SupabaseAuthProvider>
          </SupabaseProvider>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Error:', error)
    return (
      <html lang="en" className={GeistSans.className}>
        <body>
          <main className="min-h-screen">
            <div className="flex items-center justify-center h-screen">
              <p>Something went wrong. Please try again later.</p>
            </div>
          </main>
        </body>
      </html>
    )
  }
}

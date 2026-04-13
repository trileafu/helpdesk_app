import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfilePage from './ProfilePage'

export default async function Page() {
    const session = await getSession()
    if (!session) return redirect('/admin/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })

    if (!user) return redirect('/admin/login')

    return <ProfilePage initialUser={user} />
}

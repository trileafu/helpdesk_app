import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserManagement from './UserManagement'

export default async function Page() {
    const session = await getSession()
    if (!session) return redirect('/admin/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })

    if (!user || user.role !== 'superadmin') return redirect('/admin/dashboard')

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return <UserManagement initialUsers={users} currentUserId={session.userId} />
}

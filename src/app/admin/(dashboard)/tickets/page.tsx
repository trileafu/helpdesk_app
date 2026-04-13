import { prisma } from '@/lib/db'
import TicketList from './TicketList'

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tickets Management</h1>
      </div>

      <TicketList initialTickets={tickets} />
    </div>
  )
}

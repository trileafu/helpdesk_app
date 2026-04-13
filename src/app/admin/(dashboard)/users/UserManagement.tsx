'use client'

import { useState } from 'react'
import { createAdminUser, deleteAdminUser } from '@/app/admin/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, Trash2, Shield, ShieldCheck, Mail, Calendar, X, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { useActionState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function UserManagement({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: number }) {
    const [users, setUsers] = useState(initialUsers)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState<number | null>(null)

    const [createState, createAction, createPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await createAdminUser(prevState, formData)
        if (result.success) {
            setIsOpen(false)
            window.location.reload()
        }
        return result
    }, null)

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure? This user will lose all access immediately.")) return
        setLoading(userId)
        try {
            await deleteAdminUser(userId)
            setUsers(users.filter(u => u.id !== userId))
        } catch (err) {
            alert("Failed to delete user.")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" /> Add New Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-white">
                            <DialogHeader className="p-6 border-b bg-muted/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <UserPlus className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <DialogTitle className="text-xl font-bold">Create Admin Account</DialogTitle>
                                    </div>
                                </div>
                            </DialogHeader>
                            <form action={createAction}>
                                <CardContent className="pt-8 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                            <Input name="name" placeholder="John Doe" required className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                            <Input name="email" type="email" placeholder="john@domain.com" required className="h-11" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                                            <Input name="password" type="password" placeholder="••••••••" required className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Assign Role</label>
                                            <select name="role" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                <option value="admin">Admin (Technician)</option>
                                                <option value="superadmin">Superadmin (Manager)</option>
                                            </select>
                                        </div>
                                    </div>
                                    {createState?.error && (
                                        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-3 text-sm font-medium animate-shake">
                                            <AlertTriangle className="w-5 h-5" /> {createState.error}
                                        </div>
                                    )}
                                </CardContent>
                                <div className="p-6 border-t bg-muted/5 flex justify-end">
                                    <Button type="submit" disabled={createPending} className="gap-2 font-bold min-w-[160px]">
                                        {createPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        Provision User
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none ring-1 ring-border overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/30 text-muted-foreground font-bold text-[10px] uppercase tracking-widest border-b">
                                <tr>
                                    <th className="py-4 px-6 text-center w-16">Avatar</th>
                                    <th className="py-4 px-6">User Info</th>
                                    <th className="py-4 px-6">Access Level</th>
                                    <th className="py-4 px-6">Member Since</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="py-4 px-6">
                                            {u.avatar ? (
                                                <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border shadow-sm mx-auto" alt={u.name} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border shadow-sm mx-auto uppercase">
                                                    {u.name.charAt(0)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col -space-y-0.5">
                                                <span className="font-bold text-foreground flex items-center gap-2">
                                                    {u.name}
                                                    {u.id === currentUserId && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">You</span>}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="w-3 h-3 opacity-50" /> {u.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${u.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                {u.role === 'superadmin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                                {u.role}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                <span className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {u.id !== currentUserId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={loading === u.id}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 p-0"
                                                >
                                                    {loading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div >
    )
}

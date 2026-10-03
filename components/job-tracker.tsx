'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

type Status = 'Applied' | 'Shortlisted' | 'Interviewing' | 'Selected'
type Job = { id: string; company: string; url: string; description: string; appliedDate: string; status: Status; emails: string[] }

const statuses: Status[] = ['Applied', 'Shortlisted', 'Interviewing', 'Selected']
const statusStyles: Record<Status, string> = {
  Applied: 'bg-muted text-muted-foreground',
  Shortlisted: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  Interviewing: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  Selected: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
}

const emptyForm = (): Omit<Job, 'id'> => ({ company: '', url: '', description: '', appliedDate: new Date().toISOString().slice(0, 10), status: 'Applied', emails: [] })

export default function Page({ initialJobs }: { initialJobs?: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs ?? [])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [form, setForm] = useState<Omit<Job, 'id'>>(emptyForm())
  const [emailInput, setEmailInput] = useState('')

  async function saveJobs(nextJobs: Job[]) {
    const response = await fetch('/api/jobs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextJobs) })
    if (response.ok) setJobs(nextJobs)
  }

  function addEmail() {
    const value = emailInput.trim()
    if (value && !form.emails.includes(value)) setForm({ ...form, emails: [...form.emails, value] })
    setEmailInput('')
  }

  function openEditor(job: Job) {
    setEditingJob(job)
    setForm({ company: job.company, url: job.url, description: job.description, appliedDate: job.appliedDate, status: job.status, emails: [...job.emails] })
    setEmailInput('')
  }

  function closeEditor() {
    setEditingJob(null)
    setForm(emptyForm())
    setEmailInput('')
  }

  function submitJob() {
    if (!form.company.trim()) return
    if (editingJob) {
      saveJobs(jobs.map(job => job.id === editingJob.id ? { ...editingJob, ...form } : job))
      closeEditor()
      return
    }
    saveJobs([{ ...form, id: crypto.randomUUID() }, ...jobs])
    setForm(emptyForm())
    setOpenAdd(false)
  }

  function copy(value: string) { navigator.clipboard.writeText(value) }

  function formFields() {
    return <div className="grid gap-4 py-2">
      <div className="grid gap-2"><Label htmlFor="company">Company name</Label><Input id="company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
      <div className="grid gap-2"><Label htmlFor="url">Job URL</Label><Input id="url" type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /></div>
      <div className="grid gap-2"><Label htmlFor="description">Job description</Label><Textarea id="description" rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="date">Applied date</Label><Input id="date" type="date" value={form.appliedDate} onChange={e => setForm({ ...form, appliedDate: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={value => setForm({ ...form, status: value as Status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="emails">Emails</Label><div className="flex gap-2"><Input id="emails" type="email" value={emailInput} placeholder="recruiter@example.com" onChange={e => setEmailInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); addEmail() } }} /><Button type="button" variant="outline" onClick={addEmail}>Add</Button></div><div className="flex flex-wrap gap-2">{form.emails.map(email => <Badge key={email} variant="secondary" className="gap-1">{email}<button type="button" aria-label={`Remove ${email}`} onClick={() => setForm({ ...form, emails: form.emails.filter(item => item !== email) })}><X /></button></Badge>)}</div></div>
      <Button onClick={submitJob}>{editingJob ? 'Update job' : 'Save job'}</Button>
    </div>
  }

  return <main className="min-h-screen bg-muted/30 px-3 py-5 text-foreground sm:px-4 sm:py-8 md:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-semibold tracking-tight">Job tracker</h1><p className="text-sm text-muted-foreground">Keep every application in one place.</p></div><Dialog open={openAdd} onOpenChange={setOpenAdd}><DialogTrigger asChild><Button><Plus data-icon="inline-start" />Add job</Button></DialogTrigger><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Add job</DialogTitle></DialogHeader>{formFields()}</DialogContent></Dialog></div>
      <Card><CardHeader className="px-4 py-4 sm:px-6"><CardTitle className="text-base">Applications <span className="font-normal text-muted-foreground">({jobs.length})</span></CardTitle></CardHeader><Separator /><CardContent className="p-0"><div className="overflow-x-auto"><Table className="min-w-245"><TableHeader><TableRow><TableHead className="px-4 sm:px-6">Company</TableHead><TableHead>Job URL</TableHead><TableHead>Job description</TableHead><TableHead>Applied date</TableHead><TableHead>Status</TableHead><TableHead>Emails</TableHead><TableHead className="w-24 pr-4 sm:pr-6"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{jobs.length === 0 ? <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No jobs yet. Add your first application.</TableCell></TableRow> : jobs.map(job => <TableRow key={job.id}>
        <TableCell className="px-4 py-4 font-medium sm:px-6">{job.company}</TableCell>
        <TableCell className="py-4">{job.url ? <a className="inline-flex max-w-40 items-center gap-1 truncate text-primary underline-offset-4 hover:underline" href={job.url} target="_blank" rel="noreferrer">Open<ExternalLink /></a> : '—'}</TableCell>
        <TableCell className="py-4"><Button variant="link" className="h-auto p-0" onClick={() => setSelectedJob(job)}>View description</Button></TableCell>
        <TableCell className="whitespace-nowrap py-4">{job.appliedDate}</TableCell>
        <TableCell className="py-4"><Select value={job.status} onValueChange={value => saveJobs(jobs.map(item => item.id === job.id ? { ...item, status: value as Status } : item))}><SelectTrigger className={`w-36 border-0 shadow-none ${statusStyles[job.status]}`}><SelectValue /></SelectTrigger><SelectContent>{statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></TableCell>
        <TableCell className="py-4"><div className="flex max-w-64 items-center gap-2"><div className="flex min-w-0 flex-wrap gap-1.5">{job.emails.length ? job.emails.map(email => <Badge key={email} variant="secondary" className="max-w-52 truncate">{email}</Badge>) : <span className="text-sm text-muted-foreground">—</span>}</div>{job.emails.length > 0 && <Button variant="ghost" size="icon" className="shrink-0" title="Copy all emails" aria-label="Copy all emails" onClick={() => copy(job.emails.join(', '))}><Copy /></Button>}</div></TableCell>
        <TableCell className="py-4 pr-4 sm:pr-6"><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title="Edit job" aria-label={`Edit ${job.company}`} onClick={() => openEditor(job)}><Pencil /></Button><Button variant="ghost" size="icon" title="Delete job" aria-label={`Delete ${job.company}`} onClick={() => saveJobs(jobs.filter(item => item.id !== job.id))}><Trash2 /></Button></div></TableCell>
      </TableRow>)}</TableBody></Table></div></CardContent></Card>
      <Dialog open={!!editingJob} onOpenChange={open => !open && closeEditor()}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Edit job</DialogTitle></DialogHeader>{formFields()}</DialogContent></Dialog>
      <Dialog open={!!selectedJob} onOpenChange={open => !open && setSelectedJob(null)}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{selectedJob?.company} — Job description</DialogTitle></DialogHeader><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><p className="max-h-[60vh] min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap pr-1 text-sm leading-6 text-muted-foreground">{selectedJob?.description || 'No description provided.'}</p><Button variant="outline" size="sm" className="shrink-0" onClick={() => selectedJob && copy(selectedJob.description)}><Copy data-icon="inline-start" />Copy</Button></div></DialogContent></Dialog>
    </div>
  </main>
}

export { Page as JobTracker }

import { promises as fs } from 'node:fs'
import path from 'node:path'
import JobTracker from '@/components/job-tracker'

type Job = { id: string; company: string; url: string; description: string; appliedDate: string; status: 'Applied' | 'Shortlisted' | 'Interviewing' | 'Selected'; emails: string[] }

export const dynamic = 'force-dynamic'

export default async function Page() {
  const jobs = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'jobs.json'), 'utf8')) as Job[]
  return <JobTracker initialJobs={jobs} />
}

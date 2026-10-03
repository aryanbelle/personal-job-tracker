import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

const jobsPath = path.join(process.cwd(), 'data', 'jobs.json')

export async function GET() {
  const jobs = await fs.readFile(jobsPath, 'utf8')
  return NextResponse.json(JSON.parse(jobs))
}

export async function PUT(request: Request) {
  const jobs = await request.json()
  if (!Array.isArray(jobs)) {
    return NextResponse.json({ error: 'Jobs must be an array.' }, { status: 400 })
  }
  await fs.writeFile(jobsPath, JSON.stringify(jobs, null, 2) + '\n', 'utf8')
  return NextResponse.json(jobs)
}

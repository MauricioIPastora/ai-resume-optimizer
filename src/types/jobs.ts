export type UnifiedJob = {
    source: "usajobs" | "remotive" | "lever" | "greenhouse" | "google_jobs" | "google_search"
    sourceId?: string
    title: string
    companyName: string
    locationRaw?: string
    remote?: boolean
    postedAt?: string // ISO
    applyUrl: string // final apply link
    listingUrl?: string // detail page
    descriptionText?: string
  }
  
  export type OptimizeResponse = {
    summary: string
    bullets: string[]
    coverLetter: string
  }
  
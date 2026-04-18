import { Exam } from '@/types'

export const STATIC_EXAMS: Exam[] = [
  { id: 'AZ-900', title: 'Microsoft Azure Fundamentals', description: 'Foundational knowledge of cloud services and Microsoft Azure.', level: 'Fundamentals' },
  { id: 'AZ-104', title: 'Microsoft Azure Administrator', description: 'Implement, manage, and monitor Azure environments.', level: 'Associate' },
  { id: 'AZ-305', title: 'Azure Solutions Architect Expert', description: 'Design solutions that run on Azure.', level: 'Expert' },
  { id: 'AZ-500', title: 'Microsoft Azure Security Technologies', description: 'Implement security controls and threat protection.', level: 'Associate' },
  { id: 'AZ-700', title: 'Azure Network Engineer Associate', description: 'Design and implement Azure networking solutions.', level: 'Associate' },
  { id: 'AZ-800', title: 'Administering Windows Server Hybrid Core Infrastructure', description: 'Hybrid Windows Server environments.', level: 'Associate' },
  { id: 'AZ-801', title: 'Configuring Windows Server Hybrid Advanced Services', description: 'Advanced hybrid services.', level: 'Associate' },
  { id: 'MS-900', title: 'Microsoft 365 Fundamentals', description: 'Foundational knowledge of Microsoft 365 services.', level: 'Fundamentals' },
  { id: 'MS-102', title: 'Microsoft 365 Administrator', description: 'Deploy and manage Microsoft 365 tenants.', level: 'Associate' },
  { id: 'SC-900', title: 'Microsoft Security, Compliance, and Identity Fundamentals', description: 'Fundamentals of security, compliance, and identity.', level: 'Fundamentals' },
  { id: 'SC-300', title: 'Microsoft Identity and Access Administrator', description: 'Identity and access solutions using Azure AD.', level: 'Associate' },
  { id: 'DP-900', title: 'Microsoft Azure Data Fundamentals', description: 'Foundational knowledge of core data concepts.', level: 'Fundamentals' },
  { id: 'DP-300', title: 'Administering Microsoft Azure SQL Solutions', description: 'Operate SQL solutions on Microsoft Azure.', level: 'Associate' },
  { id: 'AI-900', title: 'Microsoft Azure AI Fundamentals', description: 'AI and machine learning workloads on Azure.', level: 'Fundamentals' },
  { id: 'PL-900', title: 'Microsoft Power Platform Fundamentals', description: 'Foundational knowledge of Microsoft Power Platform.', level: 'Fundamentals' },
]

export async function fetchExams(): Promise<Exam[]> {
  try {
    const res = await fetch(
      'https://learn.microsoft.com/api/catalog/?type=examinations',
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return STATIC_EXAMS
    const data = await res.json()
    const exams = data?.examinations
    if (!Array.isArray(exams) || exams.length === 0) return STATIC_EXAMS
    return exams.map((e: Record<string, string>) => ({
      id: e.examNumber ?? e.uid,
      title: e.title,
      description: e.summary ?? '',
      level: (e.level as Exam['level']) ?? 'Associate',
    }))
  } catch {
    return STATIC_EXAMS
  }
}

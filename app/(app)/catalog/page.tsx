import { fetchExams } from '@/lib/catalog'
import CatalogView from '@/components/catalog/CatalogView'

export default async function CatalogPage() {
  const exams = await fetchExams()
  return <CatalogView exams={exams} />
}

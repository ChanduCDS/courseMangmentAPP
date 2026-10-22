import { Wrench } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import { EmptyState } from '../ui/EmptyState'

export default function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="card"><EmptyState icon={<Wrench size={22} />} title="Not available yet" description={note} /></div>
    </>
  )
}

import LeadDetailContent from './LeadDetailContent';

export default function AdminLeadDetailPage() {
  return <LeadDetailContent />;
}

// Fixed for static export
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

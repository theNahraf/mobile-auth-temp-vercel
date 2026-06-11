import ServiceDetailContent from './ServiceDetailContent';

export default function ServiceDetailPage() {
  return <ServiceDetailContent />;
}

// Fixed for static export
export function generateStaticParams() {
  return [
    { id: 'mutual_funds' },
    { id: 'insurance' },
    { id: 'nps' },
    { id: 'loans' },
    { id: 'itr_filing' },
    { id: 'b2b_services' },
  ];
}

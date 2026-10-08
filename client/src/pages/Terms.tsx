import LegalPage from '@/components/LegalPage';
import { TERMS_SECTIONS } from '@/content/legal';

export default function Terms() {
  return <LegalPage title="Terms & Conditions" sections={TERMS_SECTIONS} />;
}

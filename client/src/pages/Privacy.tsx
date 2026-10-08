import LegalPage from '@/components/LegalPage';
import { PRIVACY_SECTIONS } from '@/content/legal';

export default function Privacy() {
  return <LegalPage title="Privacy Policy" sections={PRIVACY_SECTIONS} />;
}

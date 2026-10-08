import AdminLayout from '@/components/AdminLayout';
import SosCenterBoard from '@/components/sos/SosCenterBoard';

export default function AdminSos() {
  return (
    <AdminLayout>
      <SosCenterBoard padded={false} />
    </AdminLayout>
  );
}

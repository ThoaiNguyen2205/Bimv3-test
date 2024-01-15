import React from 'react';
import DocDetailContainer from '../../../../containers/dashboard/documents/detail.container';
import DashboardLayout from '../../../../layouts/dashboard/DashboardLayout';
DocumentDetailPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default function DocumentDetailPage() {
  return <DocDetailContainer />;
}

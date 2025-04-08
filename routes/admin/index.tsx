import { Head } from "$fresh/runtime.ts";
import AdminLayout from "../../components/AdminLayout.tsx";
import DashboardContent from "../../islands/DashboardContent.tsx";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard" activeSection="dashboard">
      <Head>
        <title>Dashboard - Admin Panel</title>
      </Head>
      <DashboardContent />
    </AdminLayout>
  );
}

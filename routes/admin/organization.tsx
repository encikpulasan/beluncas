import { Head } from "$fresh/runtime.ts";
import AdminLayout from "../../components/AdminLayout.tsx";
import OrganizationInfo from "../../islands/OrganizationInfo.tsx";
import LocationList from "../../islands/LocationList.tsx";

export default function Organization() {
  return (
    <AdminLayout
      title="Organization"
      activeSection="organization"
      severity="none"
    >
      <Head>
        <title>Organization Settings - Admin Dashboard</title>
      </Head>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="space-y-8">
            <OrganizationInfo />
            <LocationList />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

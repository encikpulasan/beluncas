import AdminLayout from "../../components/AdminLayout.tsx";
import ApiKeysTable from "../../islands/ApiKeysTable.tsx";

export default function ApiKeys() {
  return (
    <AdminLayout title="API Keys" activeSection="api-keys">
      <ApiKeysTable />
    </AdminLayout>
  );
}

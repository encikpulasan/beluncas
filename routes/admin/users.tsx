import AdminLayout from "../../components/AdminLayout.tsx";
import UsersTable from "../../islands/UsersTable.tsx";

export default function Users() {
  return (
    <AdminLayout title="Users" activeSection="users">
      <UsersTable />
    </AdminLayout>
  );
}

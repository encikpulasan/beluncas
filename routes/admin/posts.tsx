import AdminLayout from "../../components/AdminLayout.tsx";
import PostsTable from "../../islands/PostsTable.tsx";
import { Button } from "../../components/Button.tsx";

export default function Posts() {
  return (
    <AdminLayout title="Posts" activeSection="posts">
      <PostsTable />
    </AdminLayout>
  );
}

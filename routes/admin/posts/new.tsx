import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import AdminLayout from "../../../components/AdminLayout.tsx";
import PostEditor from "../../../islands/PostEditor.tsx";

export default function NewPostPage() {
  return (
    <AdminLayout title="Create New Post" activeSection="posts">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js"
          defer
        >
        </script>
      </Head>
      <div class="mb-6 flex items-center justify-between">
        <div>
          <a
            href="/admin/posts"
            class="text-primary-600 hover:text-primary-800 flex items-center gap-1 mb-2"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Back to Posts</span>
          </a>
          <h1 class="text-2xl font-semibold text-foreground">
            Create New Post
          </h1>
        </div>
      </div>

      <PostEditor />
    </AdminLayout>
  );
}

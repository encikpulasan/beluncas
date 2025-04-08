import { useEffect, useState } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import AdminLayout from "../../../components/AdminLayout.tsx";
import { Post, posts } from "../../../utils/api.ts";
import PostEditor from "../../../islands/PostEditor.tsx";

interface PostEditPageData {
  post?: Post;
  error?: string;
}

export const handler: Handlers<PostEditPageData> = {
  async GET(req, ctx) {
    const { id } = ctx.params;

    try {
      // For new posts, we don't need to fetch anything
      if (id === "new") {
        return ctx.render({});
      }

      // Fetch the post data
      const post = await posts.getById(id);
      return ctx.render({ post });
    } catch (error) {
      console.error("Error fetching post:", error);
      return ctx.render({ error: "Failed to load post. Please try again." });
    }
  },
};

export default function PostEditPage({ data }: PageProps<PostEditPageData>) {
  const { post, error } = data;
  const isNew = !post;
  const title = isNew ? "Create Post" : `Edit: ${post?.title}`;

  if (error) {
    return (
      <AdminLayout title="Error" activeSection="posts">
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
        <a
          href="/admin/posts"
          class="text-primary-600 hover:text-primary-800 flex items-center gap-1"
        >
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Back to Posts</span>
        </a>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={title} activeSection="posts">
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
          <h1 class="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
      </div>

      <PostEditor post={post} />
    </AdminLayout>
  );
}

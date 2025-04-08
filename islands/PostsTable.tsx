import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import PostForm, { PostFormData } from "./PostForm.tsx";
import {
  CreatePostRequest,
  Post,
  posts,
  UpdatePostRequest,
} from "../utils/api.ts";

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Helper function to render tags regardless of format
const renderTags = (tags: string | string[] | undefined) => {
  if (!tags) return null;

  let tagsArray: string[] = [];

  if (typeof tags === "string") {
    // If tags is a string, split it by commas
    tagsArray = tags.split(",").map((tag) => tag.trim());
  } else if (Array.isArray(tags)) {
    // If tags is already an array, use it directly
    tagsArray = tags;
  }

  return tagsArray.map((tag) => (
    <span
      key={tag}
      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
    >
      {tag}
    </span>
  ));
};

// Responsive table helper component
interface ResponsivePostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onPublish: (postId: string, isPublished: boolean) => void;
}

function ResponsivePostCard(
  { post, onEdit, onDelete, onPublish }: ResponsivePostCardProps,
) {
  return (
    <div class="bg-card border border-border rounded-lg p-4 mb-4">
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-medium text-foreground">{post.title}</h3>
        <div class="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(post)}
            class="p-2 hover:bg-muted rounded"
          >
            <span class="material-symbols-outlined text-primary-600">
              edit
            </span>
          </button>
          <button
            type="button"
            onClick={() => onPublish(post.id, post.isPublished)}
            class="p-2 hover:bg-muted rounded"
          >
            <span
              class={`material-symbols-outlined ${
                post.isPublished ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {post.isPublished ? "visibility" : "visibility_off"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            class="p-2 hover:bg-muted rounded"
          >
            <span class="material-symbols-outlined text-red-600">
              delete
            </span>
          </button>
        </div>
      </div>
      <div class="text-sm text-muted-foreground mb-3">
        <div class="mb-1">By {post.author} • {formatDate(post.createdAt)}</div>
        <div class="mb-2">
          <span
            class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              post.isPublished
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {post.isPublished ? "Published" : "Draft"}
          </span>
        </div>
        <p class="line-clamp-2 text-foreground mt-2">{post.content}</p>
      </div>
      <div class="flex flex-wrap gap-1 mt-2">
        {renderTags(post.tags)}
      </div>
    </div>
  );
}

export default function PostsTable() {
  const [postsList, setPosts] = useState<Post[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching posts...");
      const data = await posts.getAll();
      console.log("Posts received:", data);
      setPosts(data || []);
    } catch (err: any) {
      console.error("Failed to fetch posts:", err);
      setError(err.message || "Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = postsList.filter((post) => {
    let tagsMatch = false;
    if (post.tags) {
      if (typeof post.tags === "string") {
        tagsMatch = post.tags.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (Array.isArray(post.tags)) {
        tagsMatch = (post.tags as any[]).some((tag) =>
          typeof tag === "string" &&
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    const matchesSearch =
      (post.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (post.content?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (post.author?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      tagsMatch;

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "published" && post.isPublished) ||
      (statusFilter === "draft" && !post.isPublished);

    return matchesSearch && matchesStatus;
  });

  const handleCreatePost = () => {
    window.location.href = `/admin/posts/new`;
  };

  const handleEditPost = (post: Post) => {
    window.location.href = `/admin/posts/${post.id}`;
  };

  const handlePublishPost = async (postId: string, isPublished: boolean) => {
    try {
      const updatedPost = await posts.togglePublish(postId, !isPublished);

      // Update the post in the list
      setPosts(
        postsList.map((post) => post.id === postId ? updatedPost : post),
      );

      showFormStatus(
        "success",
        `Post ${!isPublished ? "published" : "unpublished"} successfully`,
      );
    } catch (err: any) {
      showFormStatus("error", err.message || "Failed to update post status");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      try {
        await posts.delete(postId);
        setPosts(postsList.filter((post) => post.id !== postId));
        showFormStatus("success", "Post deleted successfully");
      } catch (err: any) {
        showFormStatus("error", err.message || "Failed to delete post");
      }
    }
  };

  const handleFormSubmit = async (formData: PostFormData) => {
    try {
      if (currentPost) {
        // Update existing post
        const updateData: UpdatePostRequest = {
          title: formData.title,
          content: formData.content,
          imageUrl: formData.imageUrl,
          tags: formData.tags,
          isPublished: formData.isPublished,
        };

        console.log(
          "Sending update post request with data:",
          JSON.stringify(updateData),
          "isPublished value:",
          formData.isPublished,
        );

        const updatedPost = await posts.update(currentPost.id, updateData);

        setPosts(
          postsList.map((post) =>
            post.id === currentPost.id ? updatedPost : post
          ),
        );

        showFormStatus("success", "Post updated successfully");
        setIsFormOpen(false);
      } else {
        // Create new post
        const createData: CreatePostRequest = {
          title: formData.title,
          content: formData.content,
          imageUrl: formData.imageUrl,
          tags: formData.tags,
          isPublished: formData.isPublished,
        };

        console.log(
          "Sending create post request with data:",
          JSON.stringify(createData),
          "isPublished value:",
          formData.isPublished,
        );

        const newPost = await posts.create(createData);
        setPosts([newPost, ...postsList]);

        showFormStatus("success", "Post created successfully");
        setIsFormOpen(false);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);

      // Handle validation errors specifically
      if (err.status === 400 && err.data && err.data.details) {
        const validationErrors = err.data.details;
        let errorMessage = "Validation error:";

        // Format validation errors for display
        Object.entries(validationErrors).forEach(([field, message]) => {
          if (!field.includes(".")) { // Skip redundant error messages
            errorMessage += ` ${message}.`;
          }
        });

        showFormStatus("error", errorMessage);
      } else {
        showFormStatus("error", err.message || "Failed to save post");
      }
    }
  };

  const showFormStatus = (type: "success" | "error", message: string) => {
    setFormStatus({ type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => setFormStatus(null), 5000);
  };

  return (
    <>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Posts</h1>
          <p class="text-muted-foreground">Manage blog posts and articles</p>
        </div>
        <Button variant="primary" onClick={handleCreatePost}>
          <span class="material-symbols-outlined mr-2">add</span>
          New Post
        </Button>
      </div>

      {formStatus && (
        <div
          class={`mb-4 p-4 rounded-8 ${
            formStatus.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-2">
              {formStatus.type === "success" ? "check_circle" : "error"}
            </span>
            <p>{formStatus.message}</p>
          </div>
        </div>
      )}

      <Card>
        <div class="mb-4 flex flex-col sm:flex-row justify-between gap-4">
          <div class="relative w-full sm:w-96">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <span class="material-symbols-outlined">search</span>
            </span>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)}
              class="w-full pl-10 pr-4 py-2 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div class="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target as HTMLSelectElement).value)}
              class="px-3 py-2 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {isLoading
          ? (
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600">
              </div>
            </div>
          )
          : error
          ? (
            <div class="p-8 text-center">
              <span class="material-symbols-outlined text-red-500 text-4xl mb-2">
                error
              </span>
              <p class="text-red-600">{error}</p>
              <Button
                variant="outline"
                class="mt-4"
                onClick={fetchPosts}
              >
                Retry
              </Button>
            </div>
          )
          : (
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground rounded-tl-8">
                      Title
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Author
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground rounded-tr-8">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPosts.length === 0
                    ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No posts found. Create your first post to get started.
                        </td>
                      </tr>
                    )
                    : (
                      filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium truncate max-w-xs">
                                {post.title}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {renderTags(post.tags)}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {post.author}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                handlePublishPost(post.id, post.isPublished)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                post.isPublished
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {post.isPublished ? "Published" : "Draft"}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleEditPost(post)}
                              >
                                <span className="material-symbols-outlined text-base">
                                  edit
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                  handleDeletePost(post.id)}
                              >
                                <span className="material-symbols-outlined text-base">
                                  delete
                                </span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {isFormOpen && (
        <PostForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          post={currentPost}
        />
      )}

      {/* Mobile view */}
      <div className="md:hidden">
        {filteredPosts.length === 0
          ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts found matching your criteria.
            </div>
          )
          : (
            filteredPosts.map((post) => (
              <ResponsivePostCard
                key={post.id}
                post={post}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onPublish={handlePublishPost}
              />
            ))
          )}
      </div>
    </>
  );
}

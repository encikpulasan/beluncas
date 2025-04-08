import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Modal from "./Modal.tsx";

export interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post;
  onSubmit: (post: PostFormData) => void;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  tags: string | string[];
  imageUrl?: string;
}

export interface PostFormData {
  title: string;
  content: string;
  isPublished: boolean;
  tags: string;
  imageUrl: string;
}

export default function PostForm(
  { isOpen, onClose, post, onSubmit }: PostFormProps,
) {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    isPublished: false,
    tags: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (post) {
      const tagsString = Array.isArray(post.tags)
        ? post.tags.join(", ")
        : post.tags || "";

      setFormData({
        title: post.title,
        content: post.content,
        isPublished: post.isPublished,
        tags: tagsString,
        imageUrl: post.imageUrl || "",
      });
    } else {
      // Reset form when opening in create mode
      setFormData({
        title: "",
        content: "",
        isPublished: false,
        tags: "",
        imageUrl: "",
      });
    }
    setErrors({});
  }, [post, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (e: Event) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const name = target.name;

    // Handle checkbox (isPublished) separately to ensure it's always a boolean
    if (target.type === "checkbox") {
      const isChecked = (target as HTMLInputElement).checked;
      console.log(
        `Checkbox ${name} changed to: ${isChecked}, type: ${typeof isChecked}`,
      );

      setFormData({
        ...formData,
        [name]: isChecked, // Store the raw boolean value
      });
    } else {
      // Handle other inputs normally
      setFormData({
        ...formData,
        [name]: target.value,
      });
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post ? "Edit Post" : "Create New Post"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} class="px-4 py-2 text-base">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            class="px-4 py-2 text-base"
          >
            {post ? "Update Post" : "Create Post"}
          </Button>
        </>
      }
    >
      <form class="space-y-5" onSubmit={handleSubmit}>
        <div class="space-y-2">
          <label
            for="title"
            class="block text-base font-medium text-card-foreground mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            class={`w-full p-3 md:p-3 rounded-8 bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 text-base ${
              errors.title ? "border-red-500" : "border-border"
            }`}
          />
          {errors.title && (
            <p class="text-sm md:text-base text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        <div class="space-y-2">
          <label
            for="content"
            class="block text-base font-medium text-card-foreground mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            class={`w-full p-3 md:p-3 rounded-8 bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 text-base ${
              errors.content ? "border-red-500" : "border-border"
            }`}
          />
          {errors.content && (
            <p class="text-sm md:text-base text-red-500 mt-1">
              {errors.content}
            </p>
          )}
        </div>

        <div class="space-y-2">
          <label
            for="imageUrl"
            class="block text-base font-medium text-card-foreground mb-2"
          >
            Image URL (Optional)
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            class="w-full p-3 md:p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 text-base"
          />
        </div>

        <div class="space-y-2">
          <label
            for="tags"
            class="block text-base font-medium text-card-foreground mb-2"
          >
            Tags (Comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="news, update, charity"
            class="w-full p-3 md:p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 text-base"
          />
        </div>

        <div class="flex items-center py-2">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            class="rounded-8 text-primary-600 focus:ring-primary-300 h-5 w-5 mr-3"
          />
          <label
            for="isPublished"
            class="text-base font-medium text-card-foreground"
          >
            Publish immediately
          </label>
        </div>
      </form>
    </Modal>
  );
}

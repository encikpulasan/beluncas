// Extend Window interface to include EasyMDE and markdownit
declare global {
  interface Window {
    EasyMDE: any; // Reverting to any for window global
    markdownit: any; // Reverting to any for window global
  }
}

// Define a type for EasyMDE constructor and instance
type EasyMDEConstructor = new (
  options: Record<string, unknown>,
) => EasyMDEInstance;
type EasyMDEInstance = {
  value: (content?: string) => string;
  codemirror: {
    on: (event: string, callback: () => void) => void;
  };
  toTextArea: () => void;
};

import { useEffect, useRef, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Button } from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import {
  CreatePostRequest,
  Post,
  posts,
  UpdatePostRequest,
} from "../utils/api.ts";

// Import EasyMDE dynamically on the client side
let EasyMDE: EasyMDEConstructor | null = null;
if (IS_BROWSER) {
  import("https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js").then(
    (module) => {
      EasyMDE = (module.default || window.EasyMDE) as EasyMDEConstructor;
    },
  );
}

// Type definition for the enhanced post form data
interface PostFormData {
  title: string;
  subtitle: string;
  content: string;
  summary: string;
  type: "article" | "news" | "announcement";
  imageUrl: string;
  additionalImages: string[];
  author: string;
  category: string;
  tags: string;
  isPublished: boolean;
  metaDescription: string;
  status: "draft" | "published" | "archived";
}

export interface PostEditorProps {
  post?: Post;
}

export default function PostEditor({ post }: PostEditorProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    subtitle: "",
    content: "",
    summary: "",
    type: "article",
    imageUrl: "",
    additionalImages: [],
    author: "",
    category: "",
    tags: "",
    isPublished: false,
    metaDescription: "",
    status: "draft",
  });

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    {
      type: "success" | "error";
      message: string;
    } | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorInstance = useRef<EasyMDEInstance | null>(null);

  // Initialize the form with post data or defaults
  useEffect(() => {
    if (post) {
      // Convert post data to form data format
      const tagsString = Array.isArray(post.tags)
        ? post.tags.join(", ")
        : typeof post.tags === "string"
        ? post.tags
        : "";

      // Parse additionalImages from string to array
      let additionalImagesArray: string[] = [];
      try {
        if (post.additionalImages) {
          const decoded = post.additionalImages
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'");

          const parsed = JSON.parse(decoded);
          additionalImagesArray = Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {
        console.error("Error parsing additionalImages", e);
        // Set as empty array on error
        additionalImagesArray = [];
      }

      setFormData({
        title: post.title || "",
        subtitle: post.subtitle || "",
        content: post.content || "",
        summary: post.summary || "",
        type: post.type || "article",
        imageUrl: post.imageUrl || "",
        additionalImages: additionalImagesArray, // Always an array
        author: post.author || "",
        category: post.category || "",
        tags: tagsString,
        isPublished: post.isPublished || false,
        metaDescription: post.metaDescription || "",
        status: post.status || "draft",
      });
    }
  }, [post]);

  // Initialize the Markdown editor
  useEffect(() => {
    if (IS_BROWSER && editorRef.current && !editorInstance.current && EasyMDE) {
      const mdeOptions = {
        element: editorRef.current,
        spellChecker: true,
        autofocus: false,
        toolbar: [
          "bold",
          "italic",
          "heading",
          "|",
          "quote",
          "unordered-list",
          "ordered-list",
          "|",
          "link",
          "image",
          "table",
          "|",
          "preview",
          "side-by-side",
          "fullscreen",
          "|",
          "guide",
        ],
        placeholder: "Write your content here...",
        status: ["autosave", "lines", "words", "cursor"],
        autoSave: {
          enabled: true,
          uniqueId: `post-${post?.id || "new"}`,
          delay: 1000,
        },
      };

      try {
        // Create new EasyMDE instance with type assertion
        editorInstance.current = new EasyMDE(mdeOptions);

        // Set initial value from form data
        if (formData.content && editorInstance.current) {
          editorInstance.current.value(formData.content);
        }

        // Handle editor content changes
        if (editorInstance.current) {
          editorInstance.current.codemirror.on("change", () => {
            if (editorInstance.current) {
              const newContent = editorInstance.current.value();
              setFormData((prev) => ({ ...prev, content: newContent }));
              addDirtyField("content");
            }
          });
        }

        // Clean up on unmount
        return () => {
          if (editorInstance.current) {
            editorInstance.current.toTextArea();
            editorInstance.current = null;
          }
        };
      } catch (error) {
        console.error("Error initializing EasyMDE:", error);
      }
    }
  }, [IS_BROWSER, editorRef.current, EasyMDE]);

  // Function to mark fields as dirty
  const addDirtyField = (field: string) => {
    setDirtyFields((prev) => {
      const updated = new Set(prev);
      updated.add(field);
      return updated;
    });

    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  // Handle form input changes
  const handleChange = (e: Event) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    const name = target.name;
    let value: string | boolean = target.value;

    // Special handling for checkboxes
    if (target.type === "checkbox") {
      value = (target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    addDirtyField(name);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
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

    if (!formData.type) {
      newErrors.type = "Post type is required";
    }

    // Image URL validation
    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl =
        "Please enter a valid URL starting with http:// or https://";
    }

    // Additional images validation - validate each URL in the array
    if (formData.additionalImages.length > 0) {
      const invalidUrl = formData.additionalImages.find(
        (url) => !url || !/^https?:\/\/.+/.test(url),
      );
      if (invalidUrl) {
        newErrors.additionalImages =
          "All URLs must be valid and start with http:// or https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new image URL
  const handleAddImage = () => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ""],
    }));
  };

  // Handle removing an image URL
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  // Handle changing an image URL
  const handleImageChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newImages = [...prev.additionalImages];
      newImages[index] = value;
      return {
        ...prev,
        additionalImages: newImages,
      };
    });
    addDirtyField("additionalImages");
  };

  // Save the post
  const handleSave = async (e: Event, saveAndContinue = false) => {
    e.preventDefault();

    if (!validateForm()) {
      setSaveStatus({
        type: "error",
        message: "Please correct the errors in the form",
      });
      return;
    }

    setSaving(true);
    setSaveStatus(null);

    try {
      // Ensure additionalImages is an array before converting to JSON
      const images = Array.isArray(formData.additionalImages)
        ? formData.additionalImages
        : [];

      // Convert additionalImages array back to JSON string for API
      const additionalImagesString = JSON.stringify(images);

      // Common data for both create and update
      const postData = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        summary: formData.summary,
        type: formData.type,
        imageUrl: formData.imageUrl,
        additionalImages: additionalImagesString,
        author: formData.author,
        category: formData.category,
        tags: formData.tags,
        isPublished: formData.isPublished,
        metaDescription: formData.metaDescription,
        status: formData.status,
      };

      // Explicitly type the result variable
      let result: Post | undefined;

      if (post?.id) {
        // Update existing post
        result = await posts.update(post.id, postData as UpdatePostRequest);
        setSaveStatus({
          type: "success",
          message: "Post updated successfully",
        });
      } else {
        // Create new post
        result = await posts.create(postData as CreatePostRequest);
        setSaveStatus({
          type: "success",
          message: "Post created successfully",
        });

        // Redirect to edit page for the new post if not staying on this page
        if (!saveAndContinue && result!.id) {
          setTimeout(() => {
            window.location.href = `/admin/posts/${result!.id}`;
          }, 1000);
        }
      }

      // Reset dirty state since we've saved
      setDirtyFields(new Set());
    } catch (error: unknown) {
      console.error("Error saving post:", error);
      setSaveStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save post",
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Render preview
  const renderPreview = () => {
    return (
      <div class="bg-white border rounded shadow-sm p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{formData.title}</h1>
          {formData.subtitle && (
            <p class="text-xl text-gray-600 mb-4">{formData.subtitle}</p>
          )}

          <div class="flex flex-wrap gap-2 mb-4">
            <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
              {formData.type}
            </span>
            {formData.category && (
              <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {formData.category}
              </span>
            )}
            {formData.tags &&
              formData.tags.split(",").map((tag) => (
                <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {tag.trim()}
                </span>
              ))}
          </div>

          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt={formData.title}
              class="w-full h-64 object-cover rounded mb-6"
            />
          )}

          {formData.summary && (
            <div class="text-lg text-gray-700 mb-6 font-semibold italic">
              {formData.summary}
            </div>
          )}
        </div>

        <div class="prose prose-blue max-w-none">
          {/* Render Markdown content */}
          <div
            dangerouslySetInnerHTML={{
              __html: IS_BROWSER && window.markdownit
                ? window.markdownit().render(formData.content)
                : formData.content,
            }}
          />
        </div>

        {formData.author && (
          <div class="mt-8 border-t pt-4">
            <p class="text-gray-600">By {formData.author}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div class="space-y-6">
      {/* Status message */}
      {saveStatus && (
        <div
          class={`p-4 rounded-md mb-4 ${
            saveStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* Form controls */}
      <div class="flex gap-3 mb-5">
        <Button
          onClick={(e) => handleSave(e, false)}
          variant={saving ? "secondary" : "primary"}
          disabled={saving}
        >
          {saving ? "Saving..." : (post?.id ? "Update" : "Create & View")}
        </Button>
        <Button
          onClick={(e) => handleSave(e, true)}
          variant="secondary"
          disabled={saving}
        >
          Save & Continue Editing
        </Button>
        <Button
          onClick={togglePreview}
          variant="ghost"
          class="ml-auto"
        >
          {showPreview ? "Edit Mode" : "Preview"}
        </Button>
      </div>

      {/* Content area */}
      <div class="grid grid-cols-1 gap-6">
        {showPreview
          ? (
            // Preview Mode
            <Card>
              <div class="p-4">
                <h2 class="text-lg font-medium mb-4">Post Preview</h2>
                {renderPreview()}
              </div>
            </Card>
          )
          : (
            // Edit Mode
            <>
              {/* Main post details */}
              <Card>
                <div class="p-4">
                  <h2 class="text-lg font-medium mb-4">Post Details</h2>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div class="col-span-2">
                      <label
                        htmlFor="title"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Title <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        class={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-300 focus:outline-none ${
                          errors.title ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.title && (
                        <p class="text-red-500 text-sm mt-1">{errors.title}</p>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div class="col-span-2">
                      <label
                        htmlFor="subtitle"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subtitle
                      </label>
                      <input
                        type="text"
                        id="subtitle"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label
                        htmlFor="type"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Type <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        class={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-300 focus:outline-none ${
                          errors.type ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="article">Article</option>
                        <option value="news">News</option>
                        <option value="announcement">Announcement</option>
                      </select>
                      {errors.type && (
                        <p class="text-red-500 text-sm mt-1">{errors.type}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="category"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Category
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label
                        htmlFor="status"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Author */}
                    <div>
                      <label
                        htmlFor="author"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Author
                      </label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      />
                    </div>

                    {/* Publish checkbox */}
                    <div class="col-span-2">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublished"
                          name="isPublished"
                          checked={formData.isPublished}
                          onChange={handleChange}
                          class="h-4 w-4 text-primary-600 focus:ring-primary-300 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isPublished"
                          class="ml-2 block text-sm text-gray-700"
                        >
                          Publish immediately
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Summary and content */}
              <Card>
                <div class="p-4">
                  <h2 class="text-lg font-medium mb-4">Content</h2>

                  {/* Summary */}
                  <div class="mb-5">
                    <label
                      htmlFor="summary"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Summary
                    </label>
                    <textarea
                      id="summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      rows={3}
                      class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      placeholder="A brief summary of your post..."
                    >
                    </textarea>
                  </div>

                  {/* Main content */}
                  <div class="mb-5">
                    <label
                      htmlFor="content"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Content <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      ref={editorRef}
                      rows={12}
                      class={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-300 focus:outline-none ${
                        errors.content ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                    </textarea>
                    {errors.content && (
                      <p class="text-red-500 text-sm mt-1">{errors.content}</p>
                    )}
                  </div>

                  {/* Meta description */}
                  <div>
                    <label
                      htmlFor="metaDescription"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Meta Description
                    </label>
                    <textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      rows={2}
                      class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      placeholder="SEO description for search engines..."
                    >
                    </textarea>
                  </div>
                </div>
              </Card>

              {/* Media and tags */}
              <Card>
                <div class="p-4">
                  <h2 class="text-lg font-medium mb-4">Media & Tags</h2>

                  {/* Featured image */}
                  <div class="mb-5">
                    <label
                      htmlFor="imageUrl"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      class={`w-full p-2 border rounded focus:ring-2 focus:ring-primary-300 focus:outline-none ${
                        errors.imageUrl ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.imageUrl && (
                      <p class="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                    )}

                    {formData.imageUrl && (
                      <div class="mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Featured image preview"
                          class="h-40 object-cover rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional images */}
                  <div class="mb-5">
                    <label
                      htmlFor="additionalImages"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Additional Images
                    </label>
                    <div class="space-y-2">
                      {Array.isArray(formData.additionalImages)
                        ? formData.additionalImages.map((url, index) => (
                          <div key={index} class="flex items-center gap-2">
                            <input
                              type="url"
                              value={url}
                              onChange={(e) =>
                                handleImageChange(
                                  index,
                                  (e.target as HTMLInputElement).value,
                                )}
                              class={`flex-1 p-2 border rounded focus:ring-2 focus:ring-primary-300 focus:outline-none ${
                                errors.additionalImages
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="https://example.com/image.jpg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveImage(index)}
                              class="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                              <span class="material-symbols-outlined">
                                delete
                              </span>
                            </button>
                          </div>
                        ))
                        : null}
                      <button
                        type="button"
                        onClick={handleAddImage}
                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <span class="material-symbols-outlined mr-2">add</span>
                        Add Image
                      </button>
                      {errors.additionalImages && (
                        <p class="text-red-500 text-sm mt-1">
                          {errors.additionalImages}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label
                      htmlFor="tags"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      placeholder="charity, volunteer, news"
                    />
                  </div>
                </div>
              </Card>
            </>
          )}
      </div>
    </div>
  );
}

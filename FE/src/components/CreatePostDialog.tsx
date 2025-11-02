// components/CreatePostDialog.tsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { AxiosProgressEvent } from "axios";

interface CreatePostDialogProps {
  onPostCreated: (post: any) => void;
  trigger?: React.ReactNode;
  currentUserAvatar?: string;
  currentUserName?: string;
}

export const CreatePostDialog = ({ onPostCreated, trigger, currentUserAvatar, currentUserName }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images
    const newFiles = [...imageFiles, ...files].slice(0, 4);

    // revoke old previews to avoid leaks
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImageFiles(newFiles);
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index: number) => {
    const removedUrl = imagePreviews[index];
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("isPrivate", isPrivate ? "true" : "false");
      // backend expects field name "image" (List<MultipartFile>)
      imageFiles.forEach((f) => formData.append("image", f));

      const res = await api.post("/api/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev: AxiosProgressEvent) => {
          if (ev.total) {
            setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        },
        // If your api instance needs credentials, ensure api has withCredentials set.
      });

      const created = res?.data?.data;
      if (!created) {
        toast.error("Server trả dữ liệu không hợp lệ");
        return;
      }

      // call parent to add the created post to list
      onPostCreated(created);
      toast.success("Đã đăng bài viết!");

      // Reset form & close
      setTitle("");
      setContent("");
      setIsPrivate(false);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      setOpen(false);
    } catch (err: any) {
      console.error("Create post error:", err);
      // Prefer server message if any
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể đăng bài viết. Vui lòng thử lại.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="rounded-full shadow-lg">
            Tạo bài viết
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề (tùy chọn)</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung *</Label>
            <Textarea
              id="content"
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={5000}
              required
            />
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Label
              htmlFor="image-upload"
              className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:text-primary/80"
            >
              <ImagePlus className="h-5 w-5" />
              {imagePreviews.length === 0 ? "Thêm ảnh" : `${imagePreviews.length}/4 ảnh`}
            </Label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={imageFiles.length >= 4 || isSubmitting}
            />
          </div>

          {/* Privacy switch */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="privacy" className="text-sm font-medium">
                Bài viết riêng tư
              </Label>
              <p className="text-xs text-muted-foreground">Chỉ bạn có thể xem bài viết này</p>
            </div>
            <Switch id="privacy" checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div>
              <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                <div style={{ width: `${uploadProgress}%` }} className="h-2 bg-primary" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{uploadProgress}%</div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng..." : "Đăng bài"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

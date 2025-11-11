import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Edit,
  MapPin,
  Briefcase,
  Heart,
  MessageCircle,
  Trash2,
  Lock,
  Image as ImageIcon,
  Camera,
  Mail,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { EditProfileDialog } from "@/components/EditProfileDialog";

// Interfaces giống với Discover
interface ApiPost {
  id: number;
  content: string;
  title: string;
  imageUrl: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    fullName: string;
    gender: string | null;
    yob: string | null;
    avatar: string;
    address: string | null;
  };
  isPrivate: boolean;
  status: string;
  likeCount: number;
  dislikeCount: number;
}

interface Post {
  id: number;
  content: string;
  title: string;
  images: string[];
  timestamp: string;
  likes: number;
  commentsCount: number;
  commentsList?: CommentResp[];
  isLiked: boolean;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
}

interface CommentResp {
  id: number;
  content: string;
  createdAt: string;
  userName?: string;
  user?: { id?: number; username?: string; fullName?: string; avatar?: string };
  userAvatar?: string;
  imageUrls?: string[];
  avatar?: string;
}

interface UserProfile {
  id?: number;
  username?: string;
  name?: string;
  fullName?: string;
  age?: number;
  avatar?: string;
  isPrivate?: boolean;
  bio?: string;
  location?: string;
  address?: string;
  interests?: string[];
  albumPhotos?: string[];
  yob?: number;
  gender?: string;
  phone?: string;
  email?: string;
  major?: string;
}

const DEFAULT_AVATAR = "/default-avatar.png";

// PostCard component giống với Discover
const PostCard = ({
  post,
  onLike,
  onComment,
  refreshCommentsForPost,
  isOwner,
  onEdit,
  onDelete
}: {
  post: Post;
  onLike: (postId: number) => Promise<void>;
  onComment: (postId: number, content: string) => Promise<void>;
  refreshCommentsForPost: (postId: number) => Promise<void>;
  isOwner: boolean;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
}) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [comments, setComments] = useState<CommentResp[]>(post.commentsList ?? []);

  useEffect(() => {
    setComments(post.commentsList ?? []);
  }, [post.commentsList]);

  const authorName = post.author?.name || "Ẩn danh";
  const avatarSrc = post.author?.avatar || DEFAULT_AVATAR;

  const goToProfile = (username?: string) => {
    if (!username) return;
    navigate(`/profile/${encodeURIComponent(username)}`);
  };

  const loadMoreComments = async () => {
    try {
      setLoadingComments(true);
      const nextPage = commentsPage + 1;
      const res = await api.get(`/api/post/${post.id}/comments`, { params: { page: nextPage, size: 10 } });
      const pageData = res.data?.data;
      const newComments: CommentResp[] = pageData?.content || [];
      setComments((prev) => [...prev, ...newComments]);
      const totalPages = pageData?.totalPages ?? 1;
      setCommentsHasMore(nextPage + 1 < totalPages);
      setCommentsPage(nextPage);
    } catch (err) {
      console.error("Lỗi load more comments:", err);
      toast.error("Không thể tải thêm bình luận");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    const txt = commentText.trim();
    if (!txt) return;
    try {
      await onComment(post.id, txt);
      setCommentText("");
      setLoadingComments(true);
      await refreshCommentsForPost(post.id);
      setLoadingComments(false);
      if (!showComments) setShowComments(true);
    } catch (err) {
      setLoadingComments(false);
    }
  };

  return (
    <Card className="shadow-card hover-lift transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToProfile(post.author.username)}
            className="p-0 rounded-full focus:outline-none"
            aria-label={`Xem profile ${authorName}`}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarSrc} alt={authorName} />
              <AvatarFallback>{authorName[0]}</AvatarFallback>
            </Avatar>
          </button>

          <div className="flex-1">
            <h3 className="font-semibold text-sm">{authorName}</h3>
            <p className="text-xs text-muted-foreground">
              {post.timestamp}
            </p>
          </div>

          {isOwner && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(post)}
                aria-label="Sửa bài viết"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="text-destructive hover:text-destructive"
                aria-label="Xóa bài viết"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {post.title && <h2 className="font-bold text-lg">{post.title}</h2>}

        <p className="text-sm leading-relaxed">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <>
            {post.images.length === 1 ? (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={post.images[0]}
                  alt="Post image"
                  className="w-full h-auto object-cover rounded-lg max-h-[500px]"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((src, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg">
                    <img
                      src={src}
                      alt={`Post image ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>{post.likes} lượt thích</span>
          <span>{post.commentsCount} bình luận</span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${post.isLiked ? "text-primary" : ""}`}
            onClick={() => onLike(post.id)}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`}
            />
            Thích
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => setShowComments((s) => !s)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Bình luận
          </Button>
        </div>

        {showComments && (
          <div className="pt-3 border-t mt-2 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Viết bình luận của bạn..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button onClick={handleSubmitComment} disabled={loadingComments}>Gửi</Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-auto mt-2">
              {loadingComments ? (
                <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
              ) : comments.length > 0 ? (
                comments.map((c) => {
                  const name = c.userName ?? (c.user && (c.user as any).fullName) ?? "Ẩn danh";
                  return (
                    <div key={c.id} className="flex items-start gap-3 border-b pb-2">
                      <div className="w-8">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{(name || "A")[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{name}</div>
                        <div className="text-sm text-muted-foreground">{c.content}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(c.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có bình luận nào.</p>
              )}

              {commentsHasMore && (
                <div className="pt-2 text-center">
                  <Button variant="ghost" size="sm" onClick={loadMoreComments} disabled={loadingComments}>
                    Xem thêm bình luận
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Post Skeleton giống Discover
const PostSkeleton = () => (
  <Card className="shadow-card">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </CardContent>
  </Card>
);

const Profile = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username?: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [targetIdentifier, setTargetIdentifier] = useState<number | string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  const parseYobToYear = (yob: any): number | undefined => {
    if (yob === null || yob === undefined) return undefined;
    if (typeof yob === "number") return yob;
    if (typeof yob === "string") {
      const m1 = yob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m1) return parseInt(m1[3], 10);
      const m2 = yob.match(/^(\d{4})(?:-(\d{2})-(\d{2}))?$/);
      if (m2) return parseInt(m2[1], 10);
    }
    return undefined;
  };

  // Convert API post to Post interface (giống Discover)
  const convertApiPostToPost = useCallback((apiPost: ApiPost): Post => {
    return {
      id: apiPost.id,
      content: apiPost.content,
      title: apiPost.title,
      images: apiPost.imageUrl || [],
      timestamp: new Date(apiPost.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: apiPost.likeCount,
      commentsCount: 0,
      commentsList: [],
      isLiked: false,
      author: {
        name: apiPost.user.fullName,
        avatar: apiPost.user.avatar,
        username: apiPost.user.username
      }
    };
  }, []);

  // Load user profile
  const loadUserProfile = async (usernameParam?: string) => {
    setLoading(true);
    try {
      const loggedInUsername = localStorage.getItem("username") ?? undefined;
      const usernameToLoad = usernameParam ?? routeUsername ?? loggedInUsername;

      if (!usernameToLoad) {
        navigate("/");
        return;
      }

      const res = await api.get(`/api/users/profile/${encodeURIComponent(usernameToLoad)}`);
      const payload = res.data?.data;

      if (!payload) {
        toast.error("Không tìm thấy người dùng");
        setUser(null);
        setPosts([]);
        setTargetIdentifier(null);
        return;
      }

      const profileUser = payload.user ?? payload;

      const userObj: UserProfile = {
        id: profileUser.id,
        username: profileUser.username,
        name: profileUser.fullName ?? profileUser.name ?? profileUser.username ?? "Người dùng",
        fullName: profileUser.fullName,
        avatar: profileUser.avatar,
        location: profileUser.address ?? profileUser.location,
        isPrivate: profileUser.isPrivate ?? false,
        bio: profileUser.bio,
        yob: parseYobToYear(profileUser.yob),
        gender: profileUser.gender,
        phone: profileUser.phone,
        email: profileUser.email,
        major: profileUser.major,
        interests: profileUser.interests || ["Công nghệ", "Du lịch", "Âm nhạc"],
        albumPhotos: profileUser.albumPhotos || [],
      };

      setUser(userObj);

      if (profileUser.id) {
        setTargetIdentifier(profileUser.id);
      } else if (profileUser.username) {
        setTargetIdentifier(profileUser.username);
      } else {
        setTargetIdentifier(usernameToLoad);
      }

      if (typeof payload.isOwner === "boolean") {
        setIsOwner(payload.isOwner);
      } else {
        const isUserOwner = Boolean(loggedInUsername && (profileUser.username ?? usernameToLoad) === loggedInUsername);
        setIsOwner(isUserOwner);
      }

      if (loggedInUsername && !currentUser) {
        try {
          const currentUserRes = await api.get(`/api/users/profile/${encodeURIComponent(loggedInUsername)}`);
          const currentUserData = currentUserRes.data?.data?.user ?? currentUserRes.data?.data;
          if (currentUserData) {
            setCurrentUser({
              id: currentUserData.id,
              username: currentUserData.username,
              name: currentUserData.fullName || currentUserData.username,
            });
          }
        } catch (error) {
          console.error("Failed to load current user info", error);
        }
      }

      // Load posts
      if (Array.isArray(payload.posts)) {
        const apiPosts: ApiPost[] = payload.posts;
        const converted = apiPosts.map(convertApiPostToPost);
        setPosts(converted);

        // Fetch comments for each post
        if (converted.length > 0) {
          const fetches = converted.map(async (p) => {
            try {
              const r = await api.get(`/api/post/${p.id}/comments`, { params: { page: 0, size: 3 } });
              const pageData = r.data?.data;
              const content: CommentResp[] = pageData?.content || [];
              const totalElements: number = pageData?.totalElements ?? (content.length);
              return { postId: p.id, comments: content, count: totalElements };
            } catch (err) {
              console.error("Lỗi fetch comments for post", p.id, err);
              return { postId: p.id, comments: [], count: 0 };
            }
          });

          const results = await Promise.all(fetches);
          setPosts((prev) =>
            prev.map((p) => {
              const r = results.find((x) => x.postId === p.id);
              if (!r) return p;
              return { ...p, commentsCount: r.count, commentsList: r.comments };
            })
          );
        }
      } else {
        const identifierForPosts = profileUser.id ?? profileUser.username ?? usernameToLoad;
        await loadInitialPosts(identifierForPosts);
      }
    } catch (err: any) {
      console.error("loadUserProfile error", err);
      if (err?.response?.status === 404) {
        toast.error("Không tìm thấy người dùng");
      } else {
        toast.error("Không thể tải thông tin người dùng");
      }
      setUser(null);
      setPosts([]);
      setTargetIdentifier(null);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  };

  // Load initial posts
  const loadInitialPosts = async (identifier?: number | string) => {
    const target = identifier ?? targetIdentifier;
    if (!target) return;

    setLoading(true);
    try {
      const identifierPath = typeof target === "number" ? target : encodeURIComponent(String(target));
      const res = await api.get(`/api/post/user/${identifierPath}`, {
        params: { page: 0, size: 10 },
      });

      const payload = res.data?.data ?? res.data ?? [];
      const rawPosts = Array.isArray(payload) ? payload : payload.content ?? [];
      const apiPosts: ApiPost[] = rawPosts;
      const newPosts: Post[] = apiPosts.map(convertApiPostToPost);

      setPosts(newPosts);

      // Fetch comments for new posts
      if (newPosts.length > 0) {
        const fetches = newPosts.map(async (p) => {
          try {
            const r = await api.get(`/api/post/${p.id}/comments`, { params: { page: 0, size: 3 } });
            const pageData = r.data?.data;
            const content: CommentResp[] = pageData?.content || [];
            const totalElements: number = pageData?.totalElements ?? content.length;
            return { postId: p.id, comments: content, count: totalElements };
          } catch (err) {
            console.error("Lỗi fetch comments for post", p.id, err);
            return { postId: p.id, comments: [], count: 0 };
          }
        });

        const results = await Promise.all(fetches);
        setPosts((prev) =>
          prev.map((p) => {
            const r = results.find((x) => x.postId === p.id);
            if (!r) return p;
            return { ...p, commentsCount: r.count, commentsList: r.comments };
          })
        );
      }

      setPage(0);
      setHasMore(newPosts.length === 10);
    } catch (e) {
      console.error("loadInitialPosts error", e);
      toast.error("Không thể tải bài viết");
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Load more posts
  const loadMorePosts = async () => {
    if (!targetIdentifier || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const identifierPath = typeof targetIdentifier === "number"
        ? targetIdentifier
        : encodeURIComponent(String(targetIdentifier));

      const res = await api.get(`/api/post/user/${identifierPath}`, {
        params: { page: nextPage, size: 10 },
      });

      const payload = res.data?.data ?? res.data ?? [];
      const rawPosts = Array.isArray(payload) ? payload : payload.content ?? [];
      const apiPosts: ApiPost[] = rawPosts;
      const newPosts: Post[] = apiPosts.map(convertApiPostToPost);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);

        // Fetch comments for new posts
        const fetches = newPosts.map(async (p) => {
          try {
            const r = await api.get(`/api/post/${p.id}/comments`, { params: { page: 0, size: 3 } });
            const pageData = r.data?.data;
            const content: CommentResp[] = pageData?.content || [];
            const totalElements: number = pageData?.totalElements ?? content.length;
            return { postId: p.id, comments: content, count: totalElements };
          } catch (err) {
            console.error("Lỗi fetch comments for post", p.id, err);
            return { postId: p.id, comments: [], count: 0 };
          }
        });

        const results = await Promise.all(fetches);
        setPosts((prev) =>
          prev.map((p) => {
            const r = results.find((x) => x.postId === p.id);
            if (!r) return p;
            return { ...p, commentsCount: r.count, commentsList: r.comments };
          })
        );

        setPage(nextPage);
      }
    } catch (error) {
      console.error("loadMorePosts error", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoadingMore(false);
    }
  };

  // Update comments for a single post
  const refreshCommentsForPost = useCallback(async (postId: number) => {
    try {
      const r = await api.get(`/api/post/${postId}/comments`, { params: { page: 0, size: 10 } });
      const pageData = r.data?.data;
      const content: CommentResp[] = pageData?.content || [];
      const totalElements: number = pageData?.totalElements ?? content.length;
      setPosts((prev) => prev.map((p) => p.id === postId ? {
        ...p,
        commentsCount: totalElements,
        commentsList: content
      } : p));
    } catch (err) {
      console.error("Lỗi refresh comments for post", postId, err);
    }
  }, []);

  // Post actions
  const handleLike = useCallback(async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        await api.post(`/api/post/${postId}/dislike`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: false, likes: Math.max(0, p.likes - 1) }
              : p
          )
        );
        toast.success("Đã bỏ like bài viết");
      } else {
        await api.post(`/api/post/${postId}/like`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: true, likes: p.likes + 1 }
              : p
          )
        );
        toast.success("Đã like bài viết");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Không thể thực hiện thao tác");
    }
  }, [posts]);

  const handleComment = useCallback(async (postId: number, content: string) => {
    try {
      const form = new FormData();
      form.append("content", content.trim());

      await api.post(`/api/post/${postId}/comment`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshCommentsForPost(postId);
      toast.success("Đã gửi bình luận");
    } catch (error) {
      console.error("Error commenting:", error);
      toast.error("Không thể gửi bình luận");
      throw error;
    }
  }, [refreshCommentsForPost]);

  const handlePostCreated = useCallback((newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    toast.success("Đã đăng bài");
  }, []);

  // Profile actions
  const handleUpdateProfile = async (updateData: any) => {
    setSavingProfile(true);
    try {
      if (typeof updateData.bio === "string") {
        try {
          const patchRes = await api.patch("/api/users/bio", { bio: updateData.bio });
          const patched = patchRes.data?.data ?? patchRes.data;
          setUser((prev) => ({ ...(prev ?? {}), ...patched }));
        } catch (err) {
          console.error("Failed patching bio:", err);
          throw err;
        }
      }

      const { bio, ...other } = updateData;
      const hasOther = Object.keys(other).length > 0;
      if (hasOther) {
        const response = await api.put("/api/users/update", other);
        const updatedUserData = response.data?.data ?? response.data;
        setUser((prev) => ({
          ...(prev ?? {}),
          ...updatedUserData,
          name: updatedUserData.fullName ?? updatedUserData.name ?? prev?.name,
          fullName: updatedUserData.fullName ?? prev?.fullName,
          location: updatedUserData.address ?? updatedUserData.location ?? prev?.location,
          yob: parseYobToYear(updatedUserData.yob) ?? parseYobToYear(prev?.yob),
        }));
      }

      toast.success("Cập nhật thông tin thành công 🎉");
    } catch (error: any) {
      console.error("Update profile error:", error);
      const errorMessage = error.response?.data?.message || "Không thể cập nhật thông tin";
      toast.error(errorMessage);
      throw error;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddFriend = async () => {
    if (!user?.username) return;

    try {
      setSendingRequest(true);
      await api.post(`/api/friend/request?receiverUsername=${encodeURIComponent(user.username)}`);
      toast.success("Đã gửi lời mời kết bạn");
      setRequestSent(true);
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.message || "Không thể gửi lời mời kết bạn");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleEditBio = () => {
    setNewBio(user?.bio || "");
    setEditingBio(true);
  };

  const handleSaveBio = async () => {
    if (!newBio.trim()) {
      toast.error("Tiểu sử không được để trống");
      return;
    } setSavingBio(true);
    try {
      const patchRes = await api.patch("/api/users/bio", { bio: newBio.trim() });
      const updatedUser = patchRes.data?.data;

      setUser(prev => prev ? { ...prev, bio: newBio.trim() } : null);
      setEditingBio(false);
      toast.success("Cập nhật tiểu sử thành công 🎉");
    } catch (error: any) {
      console.error("Error updating bio:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật tiểu sử");
    } finally {
      setSavingBio(false);
    }
  };

  const handleCancelBio = () => {
    setEditingBio(false);
    setNewBio("");
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newAvatarUrl = response.data?.data?.avatar;
      if (newAvatarUrl) {
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
        toast.success("Cập nhật ảnh đại diện thành công ✨");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarUploadForDialog = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const newAvatarUrl = response.data?.data?.avatar;
    if (newAvatarUrl) {
      setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
      return newAvatarUrl;
    } else {
      throw new Error("Không thể cập nhật ảnh đại diện");
    }
  };

  // Post management
  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await api.delete(`/api/post/${postToDelete}/delete`);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      toast.success("Đã xóa bài viết");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.message || "Không thể xóa bài viết");
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setEditDialogOpen(true);
  };

  const submitEditPost = async (postId: number, title: string, content: string, files: File[] | null) => {
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          form.append("image", files[i]);
        }
      }

      const res = await api.put(`/api/post/${postId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const returned = res.data?.data ?? res.data;
      const apiPost: ApiPost = returned;
      const mapped = convertApiPostToPost(apiPost);

      // Also fetch comments for the updated post
      try {
        const r = await api.get(`/api/post/${postId}/comments`, { params: { page: 0, size: 3 } });
        const pageData = r.data?.data;
        const content: CommentResp[] = pageData?.content || [];
        const totalElements: number = pageData?.totalElements ?? content.length;
        mapped.commentsCount = totalElements;
        mapped.commentsList = content;
      } catch (err) {
        console.error("Lỗi fetch comments after edit", err);
      }

      setPosts((prev) => prev.map((p) => (p.id === postId ? mapped : p)));
      toast.success("Đã cập nhật bài viết");
      setEditDialogOpen(false);
      setEditingPost(null);
    } catch (err: any) {
      console.error("Error updating post:", err);
      toast.error(err?.response?.data?.message || "Không thể cập nhật bài viết");
      throw err;
    }
  };

  // Helper functions
  const calculateAge = (yob?: number) => {
    if (!yob) return null;
    return new Date().getFullYear() - yob;
  };

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return null;
    }
  };

  // Effects
  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUsername]);

  useEffect(() => {
    if (!hasMore || loadingMore || !user || (user.isPrivate && !isOwner)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, user, isOwner]);

  // Loading skeleton
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
        <Navbar />
        <main className="container px-4 py-8 max-w-5xl">
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </main>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
        <Navbar />
        <main className="container px-4 py-8 max-w-5xl">
          <Card className="shadow-hover">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Không tìm thấy người dùng</p>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Private profile view for non-owners
  if (user.isPrivate && !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
        <Navbar />
        <main className="container px-4 py-8 max-w-5xl">
          <Card className="shadow-hover">
            <CardContent className="py-16 text-center space-y-4">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold">Trang cá nhân riêng tư</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {user.name} đã đặt trang cá nhân ở chế độ riêng tư. Chỉ có họ mới có thể xem nội
                dung này.
              </p>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />

      <main className="container px-4 py-8 max-w-5xl space-y-6">
        {/* Cover & Header */}
        <Card className="shadow-hover overflow-hidden">
          <div className="relative h-64 bg-gradient-primary">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
            <div className="absolute bottom-6 left-6 flex items-end gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-hover">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl font-bold">
                    {(user.name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isOwner && (
                  <>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 border-4 border-background shadow-lg cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      {uploadingAvatar ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4 text-white" />
                      )}
                    </label>
                  </>
                )}
              </div>

              <div className="pb-2 space-y-1">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {user.name}
                  {user.yob && `, ${calculateAge(user.yob)}`}
                </h1>
              </div>
            </div>

            {isOwner ? (
              <div className="absolute top-4 right-4 flex gap-2">
                <EditProfileDialog
                  user={user}
                  onSave={handleUpdateProfile}
                  onAvatarUpload={handleAvatarUploadForDialog}
                  loading={savingProfile}
                  trigger={
                    <Button className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 border border-gray-200 shadow-lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  onClick={handleAddFriend}
                  disabled={sendingRequest || requestSent}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  {requestSent
                    ? "Đã gửi lời mời"
                    : sendingRequest
                      ? "Đang gửi..."
                      : "Kết bạn"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="grid md:grid-cols-[350px_1fr] gap-6">
          {/* Left sidebar: About & Album */}
          <div className="space-y-6">
            {/* About Section */}
            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Giới thiệu</h2>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditBio}
                      disabled={editingBio}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {editingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      placeholder="Nhập tiểu sử của bạn..."
                      className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={500}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelBio}
                        disabled={savingBio}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveBio}
                        disabled={savingBio}
                      >
                        {savingBio ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            Đang lưu...
                          </>
                        ) : (
                          'Lưu'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {newBio.length}/500 ký tự
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {user.bio || "Chưa có tiểu sử"}
                  </p>
                )}

                <div className="space-y-3 pt-2">
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.yob && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{calculateAge(user.yob)} tuổi</span>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{formatGender(user.gender)}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <h3 className="font-medium mb-3">Sở thích</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests?.map((interest, idx) => (
                      <Badge key={idx} variant="soft" className="px-3 py-1">
                        {interest}
                      </Badge>
                    )) || (
                        <p className="text-sm text-muted-foreground">Chưa có sở thích</p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Album Section */}
            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Album ảnh</h2>
                  {isOwner && (
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {user.albumPhotos && user.albumPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {user.albumPhotos.slice(0, 6).map((photo, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden hover-scale cursor-pointer"
                      >
                        <img
                          src={photo}
                          alt={`Album ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    Chưa có ảnh nào
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Posts */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Bài viết</h2>

            {/* Create Post Button for owner */}
            {isOwner && (
              <CreatePostDialog
                onPostCreated={handlePostCreated}
                trigger={
                  <Button className="w-full justify-center gap-3 h-14 shadow-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 text-base font-semibold rounded-xl hover:shadow-3xl transition-all duration-300">
                    Tạo bài viết mới
                  </Button>
                }
              />
            )}

            {loading && !loadingMore ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : (
              <>
                {posts.length === 0 && (
                  <Card className="shadow-card">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      {isOwner ? "Bạn chưa có bài viết nào" : "Chưa có bài viết"}
                    </CardContent>
                  </Card>
                )}

                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    refreshCommentsForPost={refreshCommentsForPost}
                    isOwner={isOwner}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteClick}
                  />
                ))}

                {loadingMore && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Đang tải...</span>
                    </div>
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Hết bài rồi 💨</p>
                  </div>
                )}

                <div ref={observerTarget} className="h-4" />
              </>
            )}
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(v) => { setEditDialogOpen(v); if (!v) setEditingPost(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>

          {editingPost ? (
            <EditPostForm
              post={editingPost}
              onCancel={() => { setEditDialogOpen(false); setEditingPost(null); }}
              onSave={submitEditPost}
            />
          ) : (
            <div>Đang tải...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// EditPostForm component
function EditPostForm({
  post,
  onCancel,
  onSave,
}: {
  post: Post;
  onCancel: () => void;
  onSave: (postId: number, title: string, content: string, files: File[] | null) => Promise<void>;
}) {
  const [title, setTitle] = useState(post.title ?? "");
  const [content, setContent] = useState(post.content ?? "");
  const [files, setFiles] = useState<File[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(post.title ?? "");
    setContent(post.content ?? "");
    setFiles(null);
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fls = e.target.files;
    if (!fls) {
      setFiles(null);
      return;
    }
    const arr: File[] = [];
    for (let i = 0; i < fls.length; i++) arr.push(fls[i]);
    setFiles(arr);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }
    if (!content.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }
    setSubmitting(true);
    try {
      await onSave(post.id, title.trim(), content.trim(), files);
    } catch (err) {
      // onSave toasts errors
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border p-2"
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nội dung</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border p-2 min-h-[120px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ảnh — có thể chọn nhiều</label>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        <div className="text-xs text-muted-foreground mt-2">
          Chọn ảnh mới để thay thế / thêm. Nếu không chọn ảnh, ảnh hiện tại sẽ giữ nguyên (backend xử lý).
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>Hủy</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}

export default Profile;
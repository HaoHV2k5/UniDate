import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PrivacyToggle } from "@/components/PrivacyToggle";
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
import {
  Edit,
  MapPin,
  Briefcase,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Lock,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

/**
 * Local minimal types — thay bằng import nếu bạn có file types riêng
 */
interface UserProfile {
  id: number;
  name: string;
  age?: number;
  avatar?: string;
  lastActive?: string;
  isPrivate?: boolean;
  bio?: string;
  job?: string;
  location?: string;
  interests?: string[];
  albumPhotos?: string[];
}

interface PostAuthor {
  id?: number;
  avatar?: string;
  name: string;
  major?: string;
}

interface Post {
  id: number;
  content?: string;
  image?: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  author: PostAuthor;
}

const Profile = () => {
  const params = useParams<{ id?: string }>();
  const rawId = params.id;

  // parsed numeric id if present
  const parsedId: number | undefined = rawId ? parseInt(rawId, 10) : undefined;
  if (rawId && Number.isNaN(parsedId as number)) {
    console.warn("Invalid profile id param:", rawId);
  }

  // states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // compute owner/viewer logic (only true when we have currentUser data or no id param)
  const currentUserIdNumber = currentUser?.id;
  const isOwner = parsedId === undefined || (currentUserIdNumber !== undefined && parsedId === currentUserIdNumber);
  const targetUserId: number | undefined = parsedId ?? currentUserIdNumber;

  // -------------------------
  // Load current user (me)
  // -------------------------
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await api.get("/api/user/me");
        // backend may wrap in { data: ... } or return object directly
        const cu: UserProfile = res.data?.data ?? res.data;
        setCurrentUser(cu);
      } catch (error) {
        // not authenticated or server error — keep currentUser null
        console.warn("Could not fetch current user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  // -------------------------
  // Load profile (target user)
  // -------------------------
  useEffect(() => {
    // wait until either parsedId exists or currentUser loaded (for /profile)
    if (parsedId === undefined && currentUser === null) return;

    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const uid = parsedId ?? currentUser!.id;
        if (uid === undefined) {
          setUser(null);
          setLoading(false);
          return;
        }
        const res = await api.get(`/api/user/${uid}`);
        const profile: UserProfile = res.data?.data ?? res.data;
        setUser(profile);
      } catch (error) {
        toast.error("Không thể tải thông tin người dùng");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedId, currentUser?.id]);

  // -------------------------
  // Load initial posts if allowed
  // -------------------------
  useEffect(() => {
    if (!user) return;
    // if profile is private and viewer is not owner -> don't load posts
    if (user.isPrivate && !isOwner) {
      setPosts([]);
      setHasMore(false);
      return;
    }
    loadInitialPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOwner]);

  // -------------------------
  // IntersectionObserver for infinite scroll
  // -------------------------
  useEffect(() => {
    if (!user) return;
    if (!hasMore) return;
    if (user.isPrivate && !isOwner) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, user, isOwner]);

  // -------------------------
  // API: posts
  // -------------------------
  const loadInitialPosts = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/post/user/${targetUserId}`, {
        params: { page: 0, size: 10 },
      });
      // backend might return Page<PostResponse> inside data or array
      const payload = res.data?.data ?? res.data ?? [];
      const newPosts: Post[] = Array.isArray(payload) ? payload : payload.content ?? [];
      setPosts(newPosts);
      setPage(0);
      setHasMore(newPosts.length === 10);
    } catch (error) {
      toast.error("Không thể tải bài viết");
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!targetUserId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get(`/api/post/user/${targetUserId}`, {
        params: { page: nextPage, size: 10 },
      });
      const payload = res.data?.data ?? res.data ?? [];
      const newPosts: Post[] = Array.isArray(payload) ? payload : payload.content ?? [];
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    } catch (error) {
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoadingMore(false);
    }
  };

  // -------------------------
  // Delete post (owner only)
  // -------------------------
  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    const old = posts;
    // optimistic UI
    setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
    setDeleteDialogOpen(false);

    try {
      await api.delete(`/api/post/${postToDelete}/delete`);
      toast.success("Đã xóa bài viết");
    } catch (error) {
      toast.error("Không thể xóa bài viết");
      setPosts(old); // rollback
    } finally {
      setPostToDelete(null);
    }
  };

  // -------------------------
  // Privacy toggle (owner only)
  // -------------------------
  const handlePrivacyToggle = async (newValue: boolean) => {
    if (!currentUser) return;
    setUpdatingPrivacy(true);
    const oldValue = user?.isPrivate ?? false;
    setUser((prev) => (prev ? { ...prev, isPrivate: newValue } : prev));

    try {
      await api.put(`/api/user/${currentUser.id}/visibility`, { isPrivate: newValue });
      toast.success(newValue ? "Đã chuyển sang riêng tư" : "Đã chuyển sang công khai");
      if (newValue && !isOwner) {
        setPosts([]);
        setHasMore(false);
      } else if (!newValue) {
        // public: reload posts
        loadInitialPosts();
      }
    } catch (error) {
      // rollback
      setUser((prev) => (prev ? { ...prev, isPrivate: oldValue } : prev));
      toast.error("Không thể cập nhật quyền riêng tư");
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  // -------------------------
  // Like (local UI only)
  // -------------------------
  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? (post.likes ?? 1) - 1 : (post.likes ?? 0) + 1,
          }
          : post
      )
    );
  };

  // -------------------------
  // Render states
  // -------------------------
  if (loading) {
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

  // -------------------------
  // Main JSX (kept as your original)
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />

      <main className="container px-4 py-8 max-w-5xl space-y-6">
        {/* Cover & Header */}
        <Card className="shadow-hover overflow-hidden">
          <div className="relative h-64 bg-gradient-primary">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
            <div className="absolute bottom-6 left-6 flex items-end gap-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-hover">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="pb-2 space-y-1">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {user.name}
                  {user.age ? `, ${user.age}` : ""}
                </h1>
                <p className="text-sm text-white/90 drop-shadow">Hoạt động {user.lastActive}</p>
              </div>
            </div>

            {isOwner && (
              <div className="absolute top-4 right-4 flex gap-2">
                <PrivacyToggle
                  isPrivate={user.isPrivate ?? false}
                  onToggle={handlePrivacyToggle}
                  disabled={updatingPrivacy}
                />
                <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
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
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground italic leading-relaxed">{user.bio}</p>

                <div className="space-y-3 pt-2">
                  {user.job && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{user.job}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <h3 className="font-medium mb-3">Sở thích</h3>
                  <div className="flex flex-wrap gap-2">
                    {(user.interests ?? []).map((interest, idx) => (
                      <Badge key={idx} variant="soft" className="px-3 py-1">
                        {interest}
                      </Badge>
                    ))}
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

                {(user.albumPhotos ?? []).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {user.albumPhotos!.map((photo, idx) => (
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
                    Chưa có ảnh nào
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Posts */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Bài viết</h2>

            {posts.length === 0 && !loading && (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {isOwner ? "Bạn chưa có bài viết nào" : "Chưa có bài viết"}
                </CardContent>
              </Card>
            )}

            {posts.map((post) => (
              <Card key={post.id} className="shadow-card hover-scale transition-all">
                <CardContent className="pt-6 space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.author.major} • {post.timestamp}
                        </p>
                      </div>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(post.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Xóa bài viết"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-sm leading-relaxed">{post.content}</p>

                  {/* Post Image */}
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img src={post.image} alt="Post" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>{post.likes ?? 0} lượt thích</span>
                    <span>{post.comments ?? 0} bình luận • chia sẻ</span>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="ghost" className="flex-1" onClick={() => handleLike(post.id)}>
                      <Heart
                        className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      Thích
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => toast("Tính năng bình luận đang phát triển")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Bình luận
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => toast("Tính năng chia sẻ đang phát triển")}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Loading & End indicators */}
            {loadingMore && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Đang tải...</span>
                </div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">Hết bài rồi 💨</div>
            )}

            <div ref={observerTarget} className="h-4" />
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
    </div>
  );
};

export default Profile;

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/api/api";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { useNavigate, useParams } from "react-router-dom";

export interface Post {
  id: number;
  content: string;
  title?: string;
  image?: string;
  timestamp?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  author?: {
    id?: number;
    name?: string;
    avatar?: string;
    major?: string;
    username?: string;
  };
}

interface UserProfile {
  id?: number;
  username?: string;
  name?: string;
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

const Profile = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username?: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // targetIdentifier can be userId (number) or username (string)
  const [targetIdentifier, setTargetIdentifier] = useState<number | string | null>(null);

  const [isOwner, setIsOwner] = useState<boolean>(false);

  // map API PostResponse -> FE Post
  const mapApiPost = (p: any): Post => ({
    id: p.id,
    content: p.content ?? "",
    title: p.title,
    image:
      Array.isArray(p.imageUrl) && p.imageUrl.length > 0
        ? p.imageUrl[0]
        : undefined,
    timestamp: p.createdAt
      ? new Date(p.createdAt).toLocaleString("vi-VN")
      : "",
    likes: p.likeCount ?? 0,
    comments: p.commentCount ?? 0,
    isLiked: p.isLiked ?? false,
    author: {
      id: p.user?.id,
      avatar: p.user?.avatar,
      name: p.user?.fullName || p.user?.username || "Ẩn danh",
      major: p.user?.major,
      username: p.user?.username,
    },
  });

  // ====== LOAD USER PROFILE (use route param or localStorage username) ======
  const loadUserProfile = async (usernameParam?: string) => {
    setLoading(true);
    try {
      const loggedInUsername = localStorage.getItem("username") ?? undefined;

      // chọn username để load: ưu tiên param truyền vào (thường là routeUsername),
      // nếu không có thì dùng routeUsername (hook), nếu vẫn không có thì fallback loggedInUsername
      const usernameToLoad = usernameParam ?? routeUsername ?? loggedInUsername;

      // nếu không có username nào để load (không đăng nhập & không có param), redirect
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

      // Xử lý response từ API profile
      const profileUser = payload.user ?? payload;

      const userObj: UserProfile = {
        id: profileUser.id,
        username: profileUser.username,
        name:
          profileUser.fullName ??
          profileUser.name ??
          profileUser.username ??
          "Người dùng",
        avatar: profileUser.avatar,
        job: profileUser.job ?? profileUser.major,
        location: profileUser.address ?? profileUser.location,
        isPrivate: profileUser.isPrivate ?? false,
        bio: profileUser.bio,
      };
      setUser(userObj);

      // set identifier for loading posts (prefer id if exists)
      if (profileUser.id) setTargetIdentifier(profileUser.id);
      else if (profileUser.username) setTargetIdentifier(profileUser.username);
      else setTargetIdentifier(usernameToLoad);

      // Xác định isOwner: ưu tiên server trả về payload.isOwner,
      // nếu server không trả thì so sánh username (route or profile) với logged in username
      if (typeof payload.isOwner === "boolean") {
        setIsOwner(payload.isOwner);
      } else {
        setIsOwner(Boolean(loggedInUsername && (profileUser.username ?? usernameToLoad) === loggedInUsername));
      }

      // Xử lý posts từ response (nếu server trả posts trong profile)
      if (Array.isArray(payload.posts)) {
        const mapped = payload.posts.map(mapApiPost);
        setPosts(mapped);
        setPage(0);
        setHasMore(mapped.length >= 10);
      } else {
        // Nếu không có posts trong response, load posts riêng dựa trên user id hoặc username
        // dùng profileUser.id nếu có, ngược lại dùng profileUser.username hoặc usernameToLoad
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

  // ====== LOAD POSTS RIÊNG (nếu profile API không trả về posts) ======
  // identifier can be user id (number) or username (string)
  const loadInitialPosts = async (identifier?: number | string) => {
    const target = identifier ?? targetIdentifier;
    if (!target) return;

    setLoading(true);
    try {
      // nếu target là số -> dùng như id, nếu là string -> dùng như username (encode)
      const identifierPath = typeof target === "number" ? target : encodeURIComponent(String(target));
      const res = await api.get(`/api/post/user/${identifierPath}`, {
        params: { page: 0, size: 10 },
      });
      const payload = res.data?.data ?? res.data ?? [];
      const raw = Array.isArray(payload) ? payload : payload.content ?? [];
      const newPosts: Post[] = raw.map(mapApiPost);
      setPosts(newPosts);
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

  const loadMorePosts = async () => {
    if (!targetIdentifier || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const identifierPath = typeof targetIdentifier === "number" ? targetIdentifier : encodeURIComponent(String(targetIdentifier));
      const res = await api.get(`/api/post/user/${identifierPath}`, {
        params: { page: nextPage, size: 10 },
      });
      const payload = res.data?.data ?? res.data ?? [];
      const raw = Array.isArray(payload) ? payload : payload.content ?? [];
      const newPosts: Post[] = raw.map(mapApiPost);
      if (newPosts.length === 0) setHasMore(false);
      else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("loadMorePosts error", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoadingMore(false);
    }
  };

  // load profile when routeUsername changes (or on mount)
  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUsername]);

  // observe for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
    // intentionally depend on hasMore/loadingMore/targetIdentifier/page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, targetIdentifier, page]);

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId);

      if (post?.isLiked) {
        await api.post(`/api/post/${postId}/dislike`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: false, likes: p.likes - 1 } : p
          )
        );
        toast.success("Đã bỏ like bài viết");
      } else {
        await api.post(`/api/post/${postId}/like`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: true, likes: p.likes + 1 } : p
          )
        );
        toast.success("Đã like bài viết");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await api.delete(`/api/post/${postId}`);
      toast.success("Đã xóa bài viết");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      toast.error("Không thể xóa bài viết");
    }
  };

  const handleComment = () => toast("Tính năng bình luận đang phát triển");

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Đã sao chép link bài viết");
    } catch (error) {
      toast("Không thể sao chép link");
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const PostCard = ({ post }: { post: Post }) => {
    const authorName = post.author?.name || "Ẩn danh";
    const avatarSrc = post.author?.avatar || "/default-avatar.png";
    const authorUsername = post.author?.username;

    const goToProfile = (username?: string) => {
      if (!username) return;
      navigate(`/profile/${encodeURIComponent(username)}`);
    };

    return (
      <Card className="shadow-card hover-lift transition-all">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToProfile(authorUsername)}
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
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {post.title && <h2 className="font-bold text-lg">{post.title}</h2>}

          <p className="text-sm leading-relaxed">{post.content}</p>

          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post image"
                className="w-full h-auto object-cover rounded-lg max-h-[500px]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>{post.likes} lượt thích</span>
            <span>{post.comments} bình luận</span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${post.isLiked ? "text-primary" : ""}`}
              onClick={() => handleLike(post.id)}
            >
              <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
              Thích
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={handleComment}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Bình luận
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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

  const UserProfileSkeleton = () => (
    <Card className="shadow-card mb-4">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />

      <main className="container max-w-2xl px-4 py-8 space-y-4">
        {/* User Profile Section */}
        {loading && !user && <UserProfileSkeleton />}

        {user && (
          <Card className="shadow-card mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{(user.name || "U")[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.job && <p className="text-muted-foreground">{user.job}</p>}
                  {user.location && <p className="text-muted-foreground">{user.location}</p>}
                  {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <CreatePostDialog
            onPostCreated={handlePostCreated}
            trigger={
              <Button size="lg" className="w-full justify-start gap-3 h-12 shadow-card">
                <Plus className="h-5 w-5" />
                Tạo bài viết mới
              </Button>
            }
          />
        )}

        {posts.length === 0 && loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
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

        {!loading && posts.length === 0 && user && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isOwner ? "Bạn chưa có bài viết nào" : "Người dùng chưa có bài viết nào"}
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
};

export default Profile;

import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/api/api";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { useNavigate } from "react-router-dom";

// Định nghĩa interface cho dữ liệu từ API
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

// Interface cho Post trong component
interface Post {
  id: number;
  content: string;
  title: string;
  image: string | null;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  author: {
    name: string;
    avatar: string;
    major: string;
    username: string;
  };
}

const Discover = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [isFirstLoadDone, setIsFirstLoadDone] = useState(false);

  // Hàm chuyển đổi từ ApiPost sang Post
  const convertApiPostToPost = (apiPost: ApiPost): Post => {
    return {
      id: apiPost.id,
      content: apiPost.content,
      title: apiPost.title,
      image: apiPost.imageUrl?.[0] || null, // Lấy ảnh đầu tiên
      timestamp: new Date(apiPost.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: apiPost.likeCount,
      comments: 0, // API không trả về số comments, có thể set mặc định
      isLiked: false, // Mặc định chưa like
      author: {
        name: apiPost.user.fullName,
        avatar: apiPost.user.avatar,
        major: "Không rõ ngành", // API không có thông tin này
        username: apiPost.user.username
      }
    };
  };

  const loadInitialPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/post");
      const apiPosts: ApiPost[] = res.data.data || [];

      // Chuyển đổi dữ liệu từ API sang định dạng Post
      const convertedPosts = apiPosts.map(convertApiPostToPost);
      setPosts(convertedPosts);
      setIsFirstLoadDone(true);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const lastId = posts[posts.length - 1]?.id;
      const res = await api.get("/api/post", { params: { lastId, size: 10 } });
      const apiPosts: ApiPost[] = res.data.data || [];
      const newPosts = apiPosts.map(convertApiPostToPost);

      if (newPosts.length === 0) setHasMore(false);
      else setPosts((prev) => [...prev, ...newPosts]);
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, posts]);

  useEffect(() => {
    if (!isFirstLoadDone) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
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
  }, [loadMorePosts, hasMore, loading, isFirstLoadDone]);

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);

      if (post?.isLiked) {
        // Nếu đã like thì bỏ like (dislike)
        await api.post(`/api/post/${postId}/dislike`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                ...p,
                isLiked: false,
                likes: p.likes - 1,
              }
              : p
          )
        );
        toast.success("Đã bỏ like bài viết");
      } else {
        // Nếu chưa like thì like
        await api.post(`/api/post/${postId}/like`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                ...p,
                isLiked: true,
                likes: p.likes + 1,
              }
              : p
          )
        );
        toast.success("Đã like bài viết");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
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

  const PostCard = ({ post }: { post: Post }) => {
    const authorName = post.author?.name || "Ẩn danh";
    const avatarSrc = post.author?.avatar || "/default-avatar.png";
    const authorMajor = post.author?.major || "Không rõ ngành";

    const goToProfile = (username?: string) => {
      if (!username) return;
      navigate(`/profile/${encodeURIComponent(username)}`);
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
                {authorMajor} • {post.timestamp}
              </p>
            </div>
          </div>

          {post.title && (
            <h2 className="font-bold text-lg">{post.title}</h2>
          )}

          <p className="text-sm leading-relaxed">{post.content}</p>

          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post image"
                className="w-full h-auto object-cover rounded-lg max-h-[500px]"
                onError={(e) => {
                  // Xử lý khi ảnh lỗi
                  e.currentTarget.style.display = 'none';
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
              <Heart
                className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`}
              />
              Thích
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleComment}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Bình luận
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleShare}
            >
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

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />

      <main className="container max-w-2xl px-4 py-8 space-y-4">
        <CreatePostDialog
          onPostCreated={handlePostCreated}
          trigger={
            <Button size="lg" className="w-full justify-start gap-3 h-12 shadow-card">
              <Plus className="h-5 w-5" />
              Tạo bài viết mới
            </Button>
          }
        />

        {!isFirstLoadDone && loading ? (
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

            {loading && (
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

        {isFirstLoadDone && posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có bài viết nào</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
};

export default Discover;
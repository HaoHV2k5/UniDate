import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Post } from "@/data/mockPosts";
import { fetchPosts } from "@/services/mockPostApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/api/api";

const Discover = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    loadInitialPosts();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, posts]);

  const loadInitialPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/post");
      setPosts(res.data.data || []);
    } catch (error) {
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const lastId = posts[posts.length - 1]?.id;
      const res = await api.get("/api/post", {
        params: { lastId, size: 10 },
      });

      const newPosts = res.data.data || [];
      if (newPosts.length === 0) setHasMore(false);
      else setPosts((prev) => [...prev, ...newPosts]);
    } catch (error) {
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
          : post
      )
    );
  };

  const handleComment = (postId: number) => {
    toast("Tính năng bình luận đang phát triển");
  };

  const handleShare = (postId: number) => {
    toast("Đã sao chép link bài viết");
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="shadow-card hover-lift transition-all">
      <CardContent className="p-4 space-y-3">
        {/* Author info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{post.author.name}</h3>
            <p className="text-xs text-muted-foreground">
              {post.author.major} • {post.timestamp}
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed">{post.content}</p>

        {/* Image */}
        {post.image && (
          <div className="rounded-lg overflow-hidden -mx-4">
            <img
              src={post.image}
              alt="Post image"
              className="w-full object-cover max-h-[400px]"
            />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>{post.likes} lượt thích</span>
          <span>{post.comments} bình luận</span>
        </div>

        {/* Actions */}
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
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => handleComment(post.id)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Bình luận
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => handleShare(post.id)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
        {/* Posts feed */}
        {posts.length === 0 && loading ? (
          // Initial loading
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

            {/* Loading more */}
            {loading && (
              <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Đang tải...</span>
                </div>
              </div>
            )}

            {/* End of feed */}
            {!hasMore && posts.length > 0 && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Hết bài rồi 💨</p>
              </div>
            )}

            {/* Intersection observer target */}
            <div ref={observerTarget} className="h-4" />
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default Discover;

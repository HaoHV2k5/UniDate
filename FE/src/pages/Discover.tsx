import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import { CreatePostDialog } from "@/components/CreatePostDialog";

// Interfaces (API shapes)
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

// Post used in UI (extended)
interface Post {
  id: number;
  content: string;
  title: string;
  images: string[]; // <-- changed: store all images
  timestamp: string;
  likes: number;
  commentsCount: number;
  commentsList?: CommentResp[]; // preview comments
  isLiked: boolean;
  author: {
    name: string;
    avatar: string;
    major: string;
    username: string;
  };
}

// Comment response (flexible: backend may differ)
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

// Small skeleton card
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

// PostCardProps
interface PostCardProps {
  post: Post;
  onLike: (postId: number) => Promise<void>;
  onComment: (postId: number, content: string) => Promise<void>;
  refreshCommentsForPost: (postId: number) => Promise<void>;
}

const DEFAULT_AVATAR = "/default-avatar.png";

const PostCard = ({ post, onLike, onComment, refreshCommentsForPost }: PostCardProps) => {
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [comments, setComments] = useState<CommentResp[]>(post.commentsList ?? []);

  useEffect(() => {
    // keep local comments in sync when parent updates post.commentsList
    setComments(post.commentsList ?? []);
  }, [post.commentsList]);

  const authorName = post.author?.name || "Ẩn danh";
  const avatarSrc = post.author?.avatar || DEFAULT_AVATAR;
  const authorMajor = post.author?.major || "Không rõ ngành";

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
      // after posting, refresh list for authoritative data
      setLoadingComments(true);
      await refreshCommentsForPost(post.id);
      setLoadingComments(false);
      // expand comments if not open
      if (!showComments) setShowComments(true);
    } catch (err) {
      setLoadingComments(false);
      // onComment already toasts on error
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
        </div>

        {post.title && <h2 className="font-bold text-lg">{post.title}</h2>}

        <p className="text-sm leading-relaxed">{post.content}</p>

        {/* Images: show single large image if only 1, otherwise a grid up to 4 */}
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
          {/* Share button removed as requested */}
        </div>

        {showComments && (
          <div className="pt-3 border-t mt-2 space-y-3">
            {/* input */}
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

            {/* list */}
            <div className="space-y-2 max-h-60 overflow-auto mt-2">
              {loadingComments ? (
                <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
              ) : comments.length > 0 ? (
                comments.map((c) => {
                  const name = c.userName ?? (c.user && (c.user as any).fullName) ?? "Ẩn danh";
                  return (
                    <div key={c.id} className="flex items-start gap-3 border-b pb-2">
                      <div className="w-8">
                        {/* only show fallback initial — DO NOT load avatar image from comment */}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{(name || "A")[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{name}</div>
                        <div className="text-sm text-muted-foreground">{c.content}</div>
                        <div className="text-xs text-muted-foreground mt-1">{new Date(c.createdAt).toLocaleString('vi-VN')}</div>
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

// Discover main component
const Discover = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFirstLoadDone, setIsFirstLoadDone] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // convert api post to Post (light)
  const convertApiPostToPost = useCallback((apiPost: ApiPost): Post => {
    return {
      id: apiPost.id,
      content: apiPost.content,
      title: apiPost.title,
      images: apiPost.imageUrl || [], // <-- store array of images
      timestamp: new Date(apiPost.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: apiPost.likeCount,
      commentsCount: 0, // will update after fetching comments
      commentsList: [],
      isLiked: false,
      author: {
        name: apiPost.user.fullName,
        avatar: apiPost.user.avatar,
        major: "Không rõ ngành",
        username: apiPost.user.username
      }
    };
  }, []);

  // fetch posts + fetch comments for each post (page 0 preview)
  const loadInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/post");
      const apiPosts: ApiPost[] = res.data.data || [];
      const converted = apiPosts.map(convertApiPostToPost);
      setPosts(converted);
      setIsFirstLoadDone(true);

      // now parallel fetch comments page 0 for each post (to get count + preview)
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

        // merge results into posts
        setPosts((prev) =>
          prev.map((p) => {
            const r = results.find((x) => x.postId === p.id);
            if (!r) return p;
            return { ...p, commentsCount: r.count, commentsList: r.comments };
          })
        );
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  }, [convertApiPostToPost]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const lastId = posts[posts.length - 1]?.id;
      const res = await api.get("/api/post", { params: { lastId, size: 10 } });
      const apiPosts: ApiPost[] = res.data.data || [];
      const newPosts = apiPosts.map(convertApiPostToPost);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);

        // fetch comments for new posts
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
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, posts, convertApiPostToPost]);

  // Update comments for a single post (used after posting a comment)
  const refreshCommentsForPost = useCallback(async (postId: number) => {
    try {
      const r = await api.get(`/api/post/${postId}/comments`, { params: { page: 0, size: 10 } });
      const pageData = r.data?.data;
      const content: CommentResp[] = pageData?.content || [];
      const totalElements: number = pageData?.totalElements ?? content.length;
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, commentsCount: totalElements, commentsList: content } : p));
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

      // update count in UI by refetching comments for that post
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

  // Effects
  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

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

  // Render
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
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                refreshCommentsForPost={refreshCommentsForPost}
              />
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

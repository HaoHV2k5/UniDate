import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
    post: any;
    onLike: (postId: number) => void;
    onComment: (postId: number, content: string) => void;
    onShare: (postId: number) => void;
}

const PostCard = ({ post, onLike, onComment, onShare }: PostCardProps) => {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    const authorName = post.author?.name || "Ẩn danh";
    const avatarSrc = post.author?.avatar || "/default-avatar.png";
    const authorMajor = post.author?.major || "Không rõ ngành";

    const goToProfile = (username?: string) => {
        if (!username) return;
        navigate(`/profile/${encodeURIComponent(username)}`);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;
        await onComment(post.id, commentText);
        setCommentText("");
    };

    return (
        <Card className="shadow-card hover-lift transition-all">
            <CardContent className="p-4 space-y-3">
                {/* header */}
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

                {/* content */}
                {post.title && <h2 className="font-bold text-lg">{post.title}</h2>}
                <p className="text-sm leading-relaxed">{post.content}</p>
                {post.image && (
                    <div className="rounded-lg overflow-hidden">
                        <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-auto object-cover rounded-lg max-h-[500px]"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                    </div>
                )}

                {/* stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>{post.likes} lượt thích</span>
                    <span>{post.comments} bình luận</span>
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 ${post.isLiked ? "text-primary" : ""}`}
                        onClick={() => onLike(post.id)}
                    >
                        <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                        Thích
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Bình luận
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => onShare(post.id)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Chia sẻ
                    </Button>
                </div>

                {/* comment box */}
                {showComments && (
                    <div className="pt-3 border-t mt-2 space-y-2">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Viết bình luận của bạn..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                            />
                            <Button onClick={handleSubmitComment}>Gửi</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
export default PostCard;
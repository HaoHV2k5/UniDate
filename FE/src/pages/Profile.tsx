import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PrivacyToggle } from "@/components/PrivacyToggle";
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
  Camera,
  Mail,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { EditProfileDialog } from "@/components/EditProfileDialog";

interface Post {
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
  fullName?: string;
  age?: number;
  avatar?: string;
  isPrivate?: boolean;
  bio?: string;
  job?: string;
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
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [targetIdentifier, setTargetIdentifier] = useState<number | string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Map API response to Post interface
  const mapApiPost = (p: any): Post => ({
    id: p.id,
    content: p.content ?? "",
    title: p.title,
    image: Array.isArray(p.imageUrl) && p.imageUrl.length > 0 ? p.imageUrl[0] : p.imageUrl,
    timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "",
    likes: p.likeCount ?? p.likes ?? 0,
    comments: p.commentCount ?? p.comments ?? 0,
    isLiked: p.isLiked ?? false,
    author: {
      id: p.user?.id,
      avatar: p.user?.avatar,
      name: p.user?.fullName || p.user?.name || p.user?.username || "Ẩn danh",
      major: p.user?.major,
      username: p.user?.username,
    },
  });

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
        job: profileUser.job ?? profileUser.major,
        location: profileUser.address ?? profileUser.location,
        isPrivate: profileUser.isPrivate ?? false,
        bio: profileUser.bio,
        yob: profileUser.yob ? new Date(profileUser.yob).getFullYear() : undefined,
        gender: profileUser.gender,
        phone: profileUser.phone,
        email: profileUser.email,
        major: profileUser.major,
        interests: profileUser.interests || ["Công nghệ", "Du lịch", "Âm nhạc"],
        albumPhotos: profileUser.albumPhotos || [],
      };

      setUser(userObj);

      // Set target identifier for posts
      if (profileUser.id) {
        setTargetIdentifier(profileUser.id);
      } else if (profileUser.username) {
        setTargetIdentifier(profileUser.username);
      } else {
        setTargetIdentifier(usernameToLoad);
      }

      // Check if current user is owner
      if (typeof payload.isOwner === "boolean") {
        setIsOwner(payload.isOwner);
      } else {
        const isUserOwner = Boolean(loggedInUsername && (profileUser.username ?? usernameToLoad) === loggedInUsername);
        setIsOwner(isUserOwner);
      }

      // Load current user info
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

      // Handle posts from response
      if (Array.isArray(payload.posts)) {
        const mappedPosts = payload.posts.map(mapApiPost);
        setPosts(mappedPosts);
        setPage(0);
        setHasMore(mappedPosts.length >= 10);
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

  const handleUpdateProfile = async (updateData: any) => {
    setSavingProfile(true);
    try {
      console.log("Sending update data:", updateData);

      // Format yob thành LocalDate nếu cần
      const formattedData = {
        ...updateData,
        yob: updateData.yob ? `${updateData.yob}-01-01` : null,
      };

      const response = await api.put("/api/users/update", formattedData);
      const updatedUserData = response.data.data;

      // Cập nhật state user
      setUser(prev => ({
        ...prev,
        ...updatedUserData,
        name: updatedUserData.fullName,
        fullName: updatedUserData.fullName,
        location: updatedUserData.address,
        yob: updatedUserData.yob ? new Date(updatedUserData.yob).getFullYear() : undefined,
      }));

      toast.success("Cập nhật thông tin thành công 🎉");
    } catch (error: any) {
      console.error("Update profile error:", error);
      const errorMessage = error.response?.data?.message || "Không thể cập nhật thông tin";
      toast.error(errorMessage);
      throw error; // Re-throw để Dialog có thể xử lý
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddFriend = async () => {
    if (!user?.username) return;

    try {
      setSendingRequest(true);

      // SỬA: Dùng api instance thay vì fetch
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
      const newPosts: Post[] = rawPosts.map(mapApiPost);

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

  // Load more posts for infinite scroll
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
      const newPosts: Post[] = rawPosts.map(mapApiPost);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("loadMorePosts error", error);
      toast.error("Không thể tải thêm bài viết");
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle avatar upload
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

  // Handle post like
  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        await api.post(`/api/post/${postId}/dislike`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: false, likes: p.likes - 1 } : p
          )
        );
      } else {
        await api.post(`/api/post/${postId}/like`);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: true, likes: p.likes + 1 } : p
          )
        );
      }
    } catch (error: any) {
      console.error("Error liking post:", error);
      toast.error(error.response?.data?.message || "Không thể thực hiện thao tác");
    }
  };

  // Handle post delete
  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await api.delete(`/api/post/${postToDelete}`);
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


  // Handle privacy toggle
  const handlePrivacyToggle = async (newValue: boolean) => {
    if (!isOwner) return;

    const oldValue = user?.isPrivate || false;
    setUpdatingPrivacy(true);

    // Optimistic update
    setUser((prev) => (prev ? { ...prev, isPrivate: newValue } : null));

    try {
      await api.put("/api/users/profile", { isPrivate: newValue });
      toast.success(newValue ? "Đã chuyển sang riêng tư" : "Đã chuyển sang công khai");
    } catch (error) {
      // Rollback on error
      setUser((prev) => (prev ? { ...prev, isPrivate: oldValue } : null));
      toast.error("Không thể cập nhật quyền riêng tư");
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  // Handle post created
  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Calculate age from year of birth
  const calculateAge = (yob?: number) => {
    if (!yob) return null;
    return new Date().getFullYear() - yob;
  };

  // Format gender display
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
                <PrivacyToggle
                  isPrivate={user.isPrivate || false}
                  onToggle={handlePrivacyToggle}
                  disabled={updatingPrivacy}
                />

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
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {user.bio || "Chưa có tiểu sử"}
                </p>

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
                        <AvatarImage src={post.author?.avatar} alt={post.author?.name} />
                        <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.author?.name || "Ẩn danh"}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.author?.major} • {post.timestamp}
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
                  {post.title && (
                    <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>

                  {/* Post Image */}
                  {post.image && (
                    <div className="rounded-lg overflow-hidden border-2 border-white/50 shadow-lg">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-auto object-cover max-h-[500px]"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>{post.likes} lượt thích</span>
                    <span>{post.comments} bình luận</span>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      Thích
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => toast.info("Tính năng bình luận đang phát triển")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Bình luận
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Đã sao chép link bài viết");
                      }}
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
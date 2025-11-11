import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { uploadAlbumImages, viewAlbum, requestAlbumAccess } from "@/services/album";

interface ProfileLite {
  id?: number;
  username?: string;
  fullName?: string;
  avatar?: string;
}

const AlbumPage = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username?: string }>();

  const [owner, setOwner] = useState<ProfileLite | null>(null);
  const [currentUser, setCurrentUser] = useState<ProfileLite | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumNoPermission, setAlbumNoPermission] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const isOwner = useMemo(() => {
    if (!owner || !currentUser) return false;
    return owner.username === currentUser.username;
  }, [owner, currentUser]);

  const albumInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const loggedInUsername = localStorage.getItem("username") ?? undefined;
      const usernameToLoad = routeUsername ?? loggedInUsername;
      if (!usernameToLoad) {
        navigate("/");
        return;
      }
      try {
        const ownerRes = await api.get(`/api/users/profile/${encodeURIComponent(usernameToLoad)}`);
        const ownerPayload = ownerRes.data?.data?.user ?? ownerRes.data?.data;
        setOwner({
          id: ownerPayload?.id,
          username: ownerPayload?.username,
          fullName: ownerPayload?.fullName,
          avatar: ownerPayload?.avatar,
        });
      } catch (e) {
        toast.error("Không tìm thấy người dùng");
        navigate("/");
        return;
      }
      if (loggedInUsername) {
        try {
          const meRes = await api.get(`/api/users/profile/${encodeURIComponent(loggedInUsername)}`);
          const me = meRes.data?.data?.user ?? meRes.data?.data;
          setCurrentUser({ id: me?.id, username: me?.username, fullName: me?.fullName, avatar: me?.avatar });
        } catch (e) {
          // ignore
        }
      }
    };
    init();
  }, [routeUsername, navigate]);

  const loadAlbum = async () => {
    if (!owner?.id) return;
    const requesterId = isOwner ? owner.id! : currentUser?.id;
    if (!requesterId) return;
    setAlbumLoading(true);
    setAlbumNoPermission(false);
    try {
      const imgs = await viewAlbum(Number(owner.id), Number(requesterId));
      setAlbumImages(imgs || []);
    } catch (err: any) {
      setAlbumImages([]);
      if (err?.response?.status === 403 || err?.response?.status === 401) setAlbumNoPermission(true);
    } finally {
      setAlbumLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner?.id, currentUser?.id, isOwner]);

  const handleAlbumUploadClick = () => {
    if (isOwner) albumInputRef.current?.click();
  };

  const handleAlbumFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!owner?.id || !e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingAlbum(true);
      const files = Array.from(e.target.files);
      const album = await uploadAlbumImages(Number(owner.id), files);
      setAlbumImages(album.imageUrls || []);
      toast.success("Tải ảnh lên thành công");
    } catch (err) {
      toast.error("Không thể tải ảnh lên");
    } finally {
      e.target.value = "";
      setUploadingAlbum(false);
    }
  };

  const handleRequestAlbumAccess = async () => {
    if (!owner?.id || !currentUser?.id) return;
    try {
      setSendingRequest(true);
      await requestAlbumAccess(Number(owner.id), Number(currentUser.id));
      setRequestSent(true);
      toast.success("Đã gửi yêu cầu xem album");
    } catch (err: any) {
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error("Không thể gửi yêu cầu");
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-muted"><User className="h-5 w-5" /></div>
          <div>
            <div className="text-sm text-muted-foreground">Album</div>
            <div className="text-xl font-semibold">{owner?.fullName || owner?.username}</div>
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Album ảnh</h2>
              {isOwner && (
                <div className="flex items-center gap-2">
                  <input
                    ref={albumInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAlbumFilesSelected}
                  />
                  <Button variant="ghost" size="sm" onClick={handleAlbumUploadClick} disabled={uploadingAlbum}>
                    <ImageIcon className="h-4 w-4" />
                    <span className="ml-2">{uploadingAlbum ? "Đang tải..." : "Tải ảnh"}</span>
                  </Button>
                </div>
              )}
            </div>

            {albumLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Đang tải album...</div>
            ) : albumImages && albumImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {albumImages.map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden hover-scale cursor-pointer">
                    <img src={photo} alt={`Album ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : !isOwner && albumNoPermission ? (
              <div className="text-center py-8 text-muted-foreground text-sm space-y-3">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <div>Bạn chưa có quyền xem album này.</div>
                <Button onClick={handleRequestAlbumAccess} disabled={sendingRequest || requestSent}>
                  {requestSent ? "Đã gửi yêu cầu" : sendingRequest ? "Đang gửi..." : "Xin quyền xem"}
                </Button>
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
      <MobileNav />
    </div>
  );
};

export default AlbumPage;


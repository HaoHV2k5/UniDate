// components/EditProfileDialog.tsx
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, X } from "lucide-react";
import { toast } from "sonner";

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

interface EditProfileDialogProps {
    user?: UserProfile;
    onSave?: (updatedData: any) => void | Promise<void>;
    onAvatarUpload?: (file: File) => Promise<string>;
    /** optional trigger node. If omitted, parent must control open via `open` + `onOpenChange`. */
    trigger?: React.ReactNode;
    /** controlled open (optional) */
    open?: boolean;
    /** controlled onOpenChange (optional) */
    onOpenChange?: (v: boolean) => void;
    loading?: boolean;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
    user,
    onSave,
    onAvatarUpload,
    trigger,
    open,
    onOpenChange,
    loading = false,
}) => {
    // uncontrolled state (used when parent doesn't control open)
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof open === "boolean";
    const openState = isControlled ? open! : internalOpen;
    const setOpenState = (v: boolean) => {
        if (isControlled) {
            onOpenChange?.(v);
        } else {
            setInternalOpen(v);
        }
    };

    // editedUser holds form fields; initialize from `user` whenever dialog opens
    const [editedUser, setEditedUser] = useState<UserProfile | null>(() =>
        user ? { ...user } : null
    );
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        if (openState && user) {
            setEditedUser({ ...user });
        }
        // if dialog closed, reset editedUser to null to avoid stale data
        if (!openState) {
            setEditedUser(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openState, user]);

    // Provide a fallback displayUser so component still renders trigger even if editedUser not set yet
    const displayUser = editedUser ?? user ?? ({} as UserProfile);

    // Avatar upload
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !onAvatarUpload) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB");
            return;
        }

        setUploadingAvatar(true);
        try {
            const newAvatarUrl = await onAvatarUpload(file);
            if (newAvatarUrl) {
                setEditedUser((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : { avatar: newAvatarUrl }));
                toast.success("Cập nhật ảnh đại diện thành công ✨");
            }
        } catch (err: any) {
            console.error("Error uploading avatar:", err);
            toast.error(err?.response?.data?.message || "Không thể cập nhật ảnh đại diện");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Save handler: supports sync or async onSave; closes dialog after success
    const handleSave = async () => {
        if (!editedUser) return;

        const updateData = {
            fullname: editedUser.fullName || editedUser.name,
            gender: editedUser.gender,
            yob: editedUser.yob,
            phone: editedUser.phone,
            address: editedUser.address || editedUser.location,
            avatar: editedUser.avatar,
            bio: editedUser.bio,
        };

        try {
            const maybePromise = onSave?.(updateData);
            if (maybePromise instanceof Promise) {
                await maybePromise;
            }
            toast.success("Đã lưu thay đổi");
            setOpenState(false);
        } catch (err: any) {
            console.error("Save failed:", err);
            toast.error(err?.message || "Lưu thất bại");
            // keep dialog open so user can retry
        }
    };

    const handleCancel = () => {
        // reset editedUser to original user snapshot and close
        setEditedUser(user ? { ...user } : null);
        setOpenState(false);
    };

    // unique id for file input to avoid collisions when multiple dialogs exist
    const fileInputId = `edit-avatar-upload-${user?.id ?? "anon"}`;

    return (
        <Dialog open={openState} onOpenChange={setOpenState}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : null}

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Chỉnh sửa thông tin cá nhân
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 ring-4 ring-blue-100">
                                <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl font-bold">
                                    {((displayUser.name || displayUser.fullName || "U")[0] || "U").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <input
                                type="file"
                                id={fileInputId}
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                            <label
                                htmlFor={fileInputId}
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 border-2 border-white shadow-lg cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110"
                                title="Thay đổi ảnh đại diện"
                            >
                                {uploadingAvatar ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Camera className="h-3 w-3 text-white" />
                                )}
                            </label>
                        </div>
                        <p className="text-sm text-gray-500">Nhấn để thay đổi ảnh đại diện</p>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fullname" className="text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên *
                                </Label>
                                <Input
                                    id="fullname"
                                    value={displayUser.fullName ?? displayUser.name ?? ""}
                                    onChange={(e) =>
                                        setEditedUser((prev) => ({ ...(prev ?? displayUser), fullName: e.target.value, name: e.target.value }))
                                    }
                                    className="rounded-lg"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </Label>
                                <Input
                                    id="phone"
                                    value={displayUser.phone ?? ""}
                                    onChange={(e) => setEditedUser((prev) => ({ ...(prev ?? displayUser), phone: e.target.value }))}
                                    className="rounded-lg"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div>
                                <Label htmlFor="yob" className="text-sm font-medium text-gray-700 mb-2">
                                    Năm sinh
                                </Label>
                                <Input
                                    id="yob"
                                    type="number"
                                    value={displayUser.yob ?? ""}
                                    onChange={(e) =>
                                        setEditedUser((prev) => ({ ...(prev ?? displayUser), yob: parseInt(e.target.value) || undefined }))
                                    }
                                    className="rounded-lg"
                                    placeholder="Nhập năm sinh"
                                    min={1900}
                                    max={new Date().getFullYear()}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2">
                                    Giới tính
                                </Label>
                                <select
                                    id="gender"
                                    value={displayUser.gender ?? ""}
                                    onChange={(e) => setEditedUser((prev) => ({ ...(prev ?? displayUser), gender: e.target.value }))}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </Label>
                                <Input
                                    id="address"
                                    value={displayUser.address ?? displayUser.location ?? ""}
                                    onChange={(e) =>
                                        setEditedUser((prev) => ({ ...(prev ?? displayUser), address: e.target.value, location: e.target.value }))
                                    }
                                    className="rounded-lg"
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={displayUser.email ?? ""}
                                    className="rounded-lg bg-gray-50"
                                    placeholder="Email"
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2">
                            Tiểu sử
                        </Label>
                        <Textarea
                            id="bio"
                            value={displayUser.bio ?? ""}
                            onChange={(e) => setEditedUser((prev) => ({ ...(prev ?? displayUser), bio: e.target.value }))}
                            placeholder="Giới thiệu về bản thân..."
                            className="rounded-lg min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            {(displayUser.bio?.length ?? 0)}/500 ký tự
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel} disabled={loading} className="gap-2 rounded-lg">
                        <X className="h-4 w-4" />
                        Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2 rounded-lg">
                        <Save className="h-4 w-4" />
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};



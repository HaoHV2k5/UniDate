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
    fullName?: string; // UI side camelCase
    // yob kept as ISO string (yyyy-MM-dd) internally for <input type="date"/>
    yob?: string | number; // accept legacy number year or ISO string
    avatar?: string;
    isPrivate?: boolean;
    bio?: string;
    job?: string;
    location?: string;
    address?: string;
    interests?: string[];
    gender?: string;
    phone?: string;
    email?: string;
}

interface EditProfileDialogProps {
    user?: UserProfile;
    onSave?: (updatedData: any) => void | Promise<void>;
    onAvatarUpload?: (file: File) => Promise<string>;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
    loading?: boolean;
}

// --- helpers for date formatting ---
const isoFromIncoming = (val?: string | number): string | undefined => {
    if (!val && val !== 0) return undefined;
    if (typeof val === "number") return `${val}-01-01`;
    // dd/MM/yyyy -> yyyy-MM-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(val))) {
        const [d, m, y] = String(val).split("/");
        return `${y}-${m}-${d}`;
    }
    // yyyy -> yyyy-01-01
    if (/^\d{4}$/.test(String(val))) return `${val}-01-01`;
    // already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(val))) return String(val);
    return String(val);
};

const to_ddMMyyyy = (iso?: string): string | undefined => {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return undefined;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const calcAge = (iso?: string) => {
    if (!iso) return 0;
    const birth = new Date(iso);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
    user,
    onSave,
    onAvatarUpload,
    trigger,
    open,
    onOpenChange,
    loading = false,
}) => {
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

    const [editedUser, setEditedUser] = useState<UserProfile | null>(() =>
        user
            ? {
                ...user,
                yob: isoFromIncoming(user.yob),
                interests: user.interests ? [...user.interests] : [],
            }
            : null
    );
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        if (openState && user) {
            setEditedUser({ ...user, yob: isoFromIncoming(user.yob), interests: user.interests ? [...user.interests] : [] });
        }
        if (!openState) {
            setEditedUser(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openState, user]);

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

    // Interests - simple tag input
    const [interestInput, setInterestInput] = useState("");
    const addInterest = (val?: string) => {
        const v = (val ?? interestInput).trim();
        if (!v) return;
        setEditedUser((prev) => {
            const next = prev ?? ({} as UserProfile);
            const arr = next.interests ? [...next.interests] : [];
            if (!arr.includes(v)) arr.push(v);
            return { ...next, interests: arr };
        });
        setInterestInput("");
    };
    const removeInterest = (val: string) =>
        setEditedUser((prev) => ({ ...(prev ?? ({} as UserProfile)), interests: (prev?.interests ?? []).filter((i) => i !== val) }));

    // validation regex same as backend
    const phoneRegex = /^(84|0[35789])[0-9]{8}\b/;

    const handleSave = async () => {
        if (!editedUser) return;

        // client-side validation
        if (!((editedUser.fullName ?? editedUser.name ?? "").trim())) {
            toast.error("Họ và tên không được để trống");
            return;
        }

        const isoYob = editedUser.yob as string | undefined;
        if (!isoYob) {
            toast.error("Ngày sinh không được để trống");
            return;
        }
        const age = calcAge(isoYob);
        if (age < 18) {
            toast.error("Bạn phải từ 18 tuổi trở lên");
            return;
        }

        const phoneVal = (editedUser.phone ?? "").trim();
        if (phoneVal && !phoneRegex.test(phoneVal)) {
            toast.error("Số điện thoại không hợp lệ");
            return;
        }

        // Prepare payload matching UpdateUserRequest (server expects dd/MM/yyyy for yob)
        const payload = {
            fullname: editedUser.fullName ?? editedUser.name ?? "",
            gender: editedUser.gender ?? null,
            yob: to_ddMMyyyy(isoYob),
            phone: phoneVal || null,
            address: editedUser.address ?? editedUser.location ?? null,
            avatar: editedUser.avatar ?? null,
            interests: editedUser.interests ?? [],
        } as any;

        try {
            const maybePromise = onSave?.(payload);
            if (maybePromise instanceof Promise) await maybePromise;
            toast.success("Đã lưu thay đổi");
            setOpenState(false);
        } catch (err: any) {
            console.error("Save failed:", err);
            toast.error(err?.message || "Lưu thất bại");
        }
    };

    const handleCancel = () => {
        setEditedUser(user ? { ...user, yob: isoFromIncoming(user.yob), interests: user.interests ? [...user.interests] : [] } : null);
        setOpenState(false);
    };

    const fileInputId = `edit-avatar-upload-${user?.id ?? "anon"}`;

    // compute max date for input date (must be at least 18 years old)
    const maxDateForYob = (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().slice(0, 10); // yyyy-mm-dd
    })();

    return (
        <Dialog open={openState} onOpenChange={setOpenState}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Chỉnh sửa thông tin cá nhân</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 ring-4 ring-blue-100">
                                <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl font-bold">
                                    {((displayUser.name || displayUser.fullName || "U")[0] || "U").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <input type="file" id={fileInputId} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
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
                                    Ngày sinh
                                </Label>
                                <Input
                                    id="yob"
                                    type="date"
                                    value={displayUser.yob ? String(displayUser.yob) : ""}
                                    onChange={(e) => setEditedUser((prev) => ({ ...(prev ?? displayUser), yob: e.target.value }))}
                                    className="rounded-lg"
                                    placeholder="Nhập ngày sinh"
                                    max={maxDateForYob}
                                />
                                <p className="text-xs text-gray-500 mt-1">Bạn phải từ 18 tuổi trở lên.</p>
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
                                <Input id="email" type="email" value={displayUser.email ?? ""} className="rounded-lg bg-gray-50" placeholder="Email" disabled />
                                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">Sở thích</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="Thêm sở thích và nhấn Enter"
                                value={interestInput}
                                onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addInterest();
                                    }
                                }}
                            />
                            <Button variant="outline" onClick={() => addInterest()} disabled={!interestInput.trim()}>
                                Thêm
                            </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {(displayUser.interests ?? []).map((it) => (
                                <div key={it} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                                    <span>{it}</span>
                                    <button onClick={() => removeInterest(it)} className="ml-1 text-xs text-gray-500">x</button>
                                </div>
                            ))}
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

import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  major: string;
  year: number;
  bio: string;
  job?: string;
  location?: string;
  avatar: string;
  coverImage?: string;
  isPrivate: boolean;
  lastActive: string;
  interests: string[];
  albumPhotos: string[];
}

export const mockUsers: Record<string, UserProfile> = {
  "current-user": {
    id: "current-user",
    name: "Nguyễn Thanh An",
    age: 21,
    major: "Công nghệ thông tin",
    year: 3,
    bio: "Thích coding, cà phê, và âm nhạc indie. Đang tìm người cùng passion về tech!",
    job: "Software Engineer Intern",
    location: "Hà Nội, Việt Nam",
    avatar: avatar1,
    isPrivate: false,
    lastActive: "5 phút trước",
    interests: ["coding", "âm nhạc", "cafe", "đọc sách", "du lịch", "nhiếp ảnh"],
    albumPhotos: [avatar1, avatar2, avatar3, avatar4],
  },
  "user-2": {
    id: "user-2",
    name: "Trần Minh Khoa",
    age: 22,
    major: "Thiết kế đồ họa",
    year: 4,
    bio: "Designer yêu thích màu sắc và sáng tạo",
    job: "UI/UX Designer",
    location: "TP. Hồ Chí Minh",
    avatar: avatar2,
    isPrivate: true,
    lastActive: "2 giờ trước",
    interests: ["design", "art", "photography"],
    albumPhotos: [avatar2, avatar3],
  },
  "user-3": {
    id: "user-3",
    name: "Lê Thu Hà",
    age: 20,
    major: "Marketing",
    year: 2,
    bio: "Passionate about digital marketing and social media",
    location: "Đà Nẵng",
    avatar: avatar3,
    isPrivate: false,
    lastActive: "30 phút trước",
    interests: ["marketing", "travel", "food"],
    albumPhotos: [avatar3, avatar4, avatar1],
  },
};

export const getCurrentUser = (): UserProfile => {
  return mockUsers["current-user"];
};

export const getUserById = (id: string): UserProfile | null => {
  return mockUsers[id] || null;
};

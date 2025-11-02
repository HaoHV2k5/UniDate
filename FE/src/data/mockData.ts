import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";

export interface User {
  id: number;
  name: string;
  major: string;
  year: number;
  age: number;
  bio: string;
  interests: string[];
  avatar: string;
  distance_km: number;
  match_score: number;
  verified: boolean;
}

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Nguyễn Thanh An",
    major: "Công nghệ thông tin",
    year: 3,
    age: 21,
    bio: "Thích coding, cà phê, và âm nhạc indie. Đang tìm người cùng passion về tech!",
    interests: ["coding", "âm nhạc", "cafe", "đọc sách"],
    avatar: avatar1,
    distance_km: 0.8,
    match_score: 92,
    verified: true,
  },
  {
    id: 2,
    name: "Trần Minh Quân",
    major: "Kinh tế",
    year: 2,
    age: 20,
    bio: "Làm đồ họa part-time, thích phim hoạt hình và nhiếp ảnh",
    interests: ["design", "anime", "photography"],
    avatar: avatar2,
    distance_km: 1.5,
    match_score: 88,
    verified: true,
  },
  {
    id: 3,
    name: "Lê Thu Trang",
    major: "Điện tử viễn thông",
    year: 4,
    age: 22,
    bio: "Thích leo núi, board game và khám phá quán ăn mới",
    interests: ["boardgame", "outdoor", "ẩm thực"],
    avatar: avatar3,
    distance_km: 2.2,
    match_score: 74,
    verified: true,
  },
  {
    id: 4,
    name: "Phạm Hoàng Minh",
    major: "Ngôn ngữ Anh",
    year: 1,
    age: 19,
    bio: "Đọc sách, viết lách và thích giao lưu bằng tiếng Anh",
    interests: ["reading", "writing", "languages"],
    avatar: avatar4,
    distance_km: 0.5,
    match_score: 81,
    verified: true,
  },
  {
    id: 5,
    name: "Hoàng Gia Bảo",
    major: "Công nghệ thông tin",
    year: 2,
    age: 20,
    bio: "Streamer part-time, yêu nhạc indie và gaming",
    interests: ["music", "stream", "gaming"],
    avatar: avatar2,
    distance_km: 3.4,
    match_score: 69,
    verified: true,
  },
  {
    id: 6,
    name: "Đặng Khánh Linh",
    major: "Marketing",
    year: 3,
    age: 21,
    bio: "Content creator, thích du lịch và chụp ảnh",
    interests: ["travel", "photography", "social media"],
    avatar: avatar1,
    distance_km: 1.2,
    match_score: 85,
    verified: true,
  },
  {
    id: 7,
    name: "Võ Đức Anh",
    major: "Kỹ thuật cơ khí",
    year: 4,
    age: 23,
    bio: "Đam mê xe cộ, công nghệ và thể thao",
    interests: ["automotive", "sports", "technology"],
    avatar: avatar4,
    distance_km: 2.8,
    match_score: 72,
    verified: true,
  },
  {
    id: 8,
    name: "Ngô Mai Phương",
    major: "Thiết kế đồ họa",
    year: 2,
    age: 20,
    bio: "Yêu nghệ thuật, vẽ tranh và thời trang",
    interests: ["art", "fashion", "design"],
    avatar: avatar3,
    distance_km: 1.8,
    match_score: 79,
    verified: true,
  },
  {
    id: 9,
    name: "Bùi Tuấn Kiệt",
    major: "Quản trị kinh doanh",
    year: 3,
    age: 22,
    bio: "Startup enthusiast, thích networking và cafe",
    interests: ["business", "networking", "cafe"],
    avatar: avatar2,
    distance_km: 0.9,
    match_score: 86,
    verified: true,
  },
  {
    id: 10,
    name: "Lý Hương Giang",
    major: "Báo chí truyền thông",
    year: 2,
    age: 20,
    bio: "Thích viết blog, làm video và khám phá văn hóa",
    interests: ["writing", "video", "culture"],
    avatar: avatar1,
    distance_km: 1.1,
    match_score: 83,
    verified: true,
  },
  {
    id: 11,
    name: "Trương Hải Long",
    major: "Công nghệ thông tin",
    year: 3,
    age: 21,
    bio: "AI & ML enthusiast, thích coding và đọc sách công nghệ",
    interests: ["AI", "coding", "tech books"],
    avatar: avatar4,
    distance_km: 2.5,
    match_score: 90,
    verified: true,
  },
  {
    id: 12,
    name: "Phan Ngọc Anh",
    major: "Tâm lý học",
    year: 4,
    age: 23,
    bio: "Yêu tâm lý học, yoga và thiền định",
    interests: ["psychology", "yoga", "meditation"],
    avatar: avatar3,
    distance_km: 1.6,
    match_score: 77,
    verified: true,
  },
];

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  datetime: string;
  participants: number[];
  isPrivate: boolean;
}

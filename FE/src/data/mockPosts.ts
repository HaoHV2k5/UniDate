import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import heroStudents from "@/assets/hero-students.jpg";
import appMockup from "@/assets/app-mockup.jpg";

export interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    major: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      name: "Nguyễn Minh Anh",
      avatar: avatar1,
      major: "Công nghệ thông tin",
    },
    content: "Hôm nay có ai muốn cùng đi cafe học bài không? Mình đang ở thư viện trường, ai rảnh thì ghé nha! ☕📚",
    image: heroStudents,
    timestamp: "5 phút trước",
    likes: 24,
    comments: 8,
    isLiked: false,
  },
  {
    id: 2,
    author: {
      name: "Trần Văn Bình",
      avatar: avatar2,
      major: "Kinh tế",
    },
    content: "Vừa hoàn thành presentation cho môn Marketing. Cảm ơn mọi người đã support 💪✨",
    timestamp: "15 phút trước",
    likes: 45,
    comments: 12,
    isLiked: true,
  },
  {
    id: 3,
    author: {
      name: "Lê Thị Cẩm",
      avatar: avatar3,
      major: "Điện tử viễn thông",
    },
    content: "Sắp thi cuối kỳ rồi, ai có tài liệu môn Mạch điện tử chia sẻ cho mình với! 🙏",
    timestamp: "1 giờ trước",
    likes: 18,
    comments: 23,
    isLiked: false,
  },
  {
    id: 4,
    author: {
      name: "Phạm Hoàng Dũng",
      avatar: avatar4,
      major: "Công nghệ thông tin",
    },
    content: "Check out app mới mình làm! Feedback nha mọi người 🚀💻",
    image: appMockup,
    timestamp: "2 giờ trước",
    likes: 67,
    comments: 34,
    isLiked: true,
  },
  {
    id: 5,
    author: {
      name: "Nguyễn Minh Anh",
      avatar: avatar1,
      major: "Công nghệ thông tin",
    },
    content: "Buổi tối vui với team project! Đã hoàn thành 80% rồi 🎉",
    timestamp: "3 giờ trước",
    likes: 32,
    comments: 6,
    isLiked: false,
  },
  {
    id: 6,
    author: {
      name: "Trần Văn Bình",
      avatar: avatar2,
      major: "Kinh tế",
    },
    content: "Ai biết quán ăn ngon gần trường không? Đói quá rồi 😋🍜",
    timestamp: "4 giờ trước",
    likes: 28,
    comments: 15,
    isLiked: false,
  },
  {
    id: 7,
    author: {
      name: "Lê Thị Cẩm",
      avatar: avatar3,
      major: "Điện tử viễn thông",
    },
    content: "Workshop về IoT hôm nay rất hay! Cảm ơn các thầy cô đã tổ chức 👏",
    timestamp: "5 giờ trước",
    likes: 41,
    comments: 9,
    isLiked: true,
  },
  {
    id: 8,
    author: {
      name: "Phạm Hoàng Dũng",
      avatar: avatar4,
      major: "Công nghệ thông tin",
    },
    content: "Tìm teammate cho hackathon tuần sau. Cần 1 designer và 1 backend dev! DM mình nha 🔥",
    timestamp: "6 giờ trước",
    likes: 56,
    comments: 27,
    isLiked: false,
  },
  {
    id: 9,
    author: {
      name: "Nguyễn Minh Anh",
      avatar: avatar1,
      major: "Công nghệ thông tin",
    },
    content: "Thứ 6 rồi! Cuối tuần các bạn có kế hoạch gì không? 🎊",
    timestamp: "8 giờ trước",
    likes: 73,
    comments: 42,
    isLiked: true,
  },
  {
    id: 10,
    author: {
      name: "Trần Văn Bình",
      avatar: avatar2,
      major: "Kinh tế",
    },
    content: "Vừa pass môn kinh tế vĩ mô! Cảm động quá 😭✨",
    timestamp: "10 giờ trước",
    likes: 89,
    comments: 38,
    isLiked: true,
  },
];

// Generate more posts for infinite scroll
export const generateMorePosts = (startId: number, count: number): Post[] => {
  const posts: Post[] = [];
  const authors = [
    { name: "Nguyễn Minh Anh", avatar: avatar1, major: "Công nghệ thông tin" },
    { name: "Trần Văn Bình", avatar: avatar2, major: "Kinh tế" },
    { name: "Lê Thị Cẩm", avatar: avatar3, major: "Điện tử viễn thông" },
    { name: "Phạm Hoàng Dũng", avatar: avatar4, major: "Công nghệ thông tin" },
  ];

  const contents = [
    "Hôm nay thời tiết đẹp quá! Ai đi chơi không? 🌞",
    "Study session vào tối mai, ai tham gia không? 📖",
    "Cần tìm sách cho môn này, ai có cho mượn không? 📚",
    "Vừa xem phim hay lắm, recommend cho mọi người! 🎬",
    "Deadline đến gần rồi, cố lên nào! 💪",
    "Có ai muốn cùng đi gym không? 🏋️",
    "Đang tìm người cùng học nhóm môn này 👥",
    "Sáng nay ăn gì ngon nhỉ? 🍔",
  ];

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const author = authors[i % authors.length];
    const content = contents[i % contents.length];
    
    posts.push({
      id,
      author,
      content,
      image: i % 3 === 0 ? (i % 2 === 0 ? heroStudents : appMockup) : undefined,
      timestamp: `${Math.floor(Math.random() * 24)} giờ trước`,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      isLiked: Math.random() > 0.5,
    });
  }

  return posts;
};

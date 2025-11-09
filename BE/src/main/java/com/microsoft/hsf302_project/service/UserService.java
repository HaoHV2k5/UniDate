package com.microsoft.hsf302_project.service;



import com.microsoft.hsf302_project.dto.request.*;

import com.microsoft.hsf302_project.dto.response.*;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.UserMapper;

import com.microsoft.hsf302_project.repo.LikeRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.microsoft.hsf302_project.repository.CommentRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor

public class UserService {

    private final UserRepo userRepo;
    private final CommentRepository commentRepository;
    private final LikeRepo likeRepo;

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final  OtpService otpService;
    private final AuthService authService;
    private final PostService postService;
    private final FriendService friendService;
    private final AlbumService albumService;
    private final NotificationService notificationService;

    public List<UserResponse> getAllUsers() {
        return userRepo.findAll().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }



    public void deleteUser(Long id) {
        if (!userRepo.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepo.deleteById(id);
    }

//    public UserResponse updatePassword(Long id, UserPasswordUpdateRequest request) {
//        User user = userRepo.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
//        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
//            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
//        }
//        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//        userRepo.save(user);
//        return userMapper.toUserResponse(user);
//    }

    public UserResponse createProfile(Long id, UserProfileRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }
    public User getUser(String email){
        User user = userRepo.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return user;

    }

    public UserResponse getUserByUsername(String username){
        User user = userRepo.getUserByUsername(username);
        return userMapper.toUserResponse(user);
    }

    public boolean resetPassword(ResetPasswordRequest request, User user) {
        boolean check  = true;
        boolean checkOtp = otpService.verifyOtpCode(user, request.getOtp());
        if(!checkOtp){

            throw  new AppException(ErrorCode.OTP_INVALID);

        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        return check;

    }


    public Long getIdByUsername(String username) {
        User user = userRepo.getUserByUsername(username);
        if(user == null){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return user.getId();
    }

    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserFromRequest(request, user);
        User savedUser = userRepo.save(user);
        return userMapper.toUserResponse(savedUser);
    }

    public void updatePassword(User user,String password){
        user.setPassword(passwordEncoder.encode(password));
        userRepo.save(user);
    }

    public UserResponse createUserByAdmin(UserRequest request) {
        User user = authService.processRegisterByAdmin(
                request.getUsername(),
                request.getPassword(),
                request.getConfirmPassword(),
                () -> {
                    User u = new User();
                    u.setUsername(request.getUsername());
                    u.setPassword(request.getPassword());
                    u.setFullName(request.getFullName());
                    u.setRole(request.getRole() != null ? request.getRole() : "USER");
                    u.setEmail(request.getUsername());
                    return u;
                }
        );
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUserByAdmin(Long id, UserUpdateRequest request) {
        User user = userRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if(request.getFullName() != null) user.setFullName(request.getFullName());
        if(request.getRole() != null) user.setRole(request.getRole());
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    public List<UserResponse> getAllUser(){
        List<User> list = userRepo.findAll();
        return userMapper.toUserListResponse(list);
    }

    public UserProfileResponse getUserProfileWithPosts(String usernameViewing, String usernameOwner) {
        User user = userRepo.getUserByUsername(usernameOwner);
        UserResponse userResponse = userMapper.toUserResponse(user);
        boolean isOwner = usernameViewing != null && usernameViewing.equals(usernameOwner);
        boolean isFriend = !isOwner && friendService.getFriendsByUsername(usernameOwner).stream()
            .anyMatch(friend -> friend.getUsername().equals(usernameViewing));
        boolean hasFullAccess = isOwner || isFriend;
        List<PostResponse> posts = postService.getPostsForProfile(usernameOwner, hasFullAccess);
        List<String> album = null;
        try {
            album = albumService.viewAlbum(user.getId(), user.getId()); // show full nếu là chính chủ
        } catch (Exception ignored) {}
        return UserProfileResponse.builder()
                            .user(userResponse)
                            .posts(posts)
                            .isOwner(hasFullAccess)
                            .album(album)
                            .build();
    }

    // Gợi ý bạn bè (3 người phù hợp nhất)
    public List<UserResponse> suggestUsers(String currentUsername, int size) {
        User me = userRepo.getUserByUsername(currentUsername);
        Set<String> relatedUsernames = friendService.getAllRelatedUsernames(currentUsername);

        List<User> allUsers = userRepo.findAll();
        List<User> candidateList = new ArrayList<>();

        // Bước 1: Lọc các user hợp lệ
        for (User u : allUsers) {
            if (relatedUsernames.contains(u.getUsername())) {
                continue; // đã có quan hệ hoặc là chính mình
            }
            if (u.isLocked()) {
                continue;
            }
            if (!u.isVerified()) {
                continue;
            }
            if (u.getRole() != null && u.getRole().equalsIgnoreCase("ADMIN")) {
                continue;
            }
            candidateList.add(u);
        }

        // Bước 2: Sắp xếp theo mức độ phù hợp
        // Ưu tiên khác giới, sau đó gần tuổi nhất
        Collections.sort(candidateList, new Comparator<User>() {
            @Override
            public int compare(User a, User b) {
                boolean aOpposite = isOppositeGender(me.getGender(), a.getGender());
                boolean bOpposite = isOppositeGender(me.getGender(), b.getGender());

                // Ưu tiên khác giới trước
                if (aOpposite && !bOpposite) return -1;
                if (!aOpposite && bOpposite) return 1;

                // Nếu cùng giới tính, so sánh khoảng cách tuổi
                int aAgeDiff = getAgeDistance(me.getYob(), a.getYob());
                int bAgeDiff = getAgeDistance(me.getYob(), b.getYob());
                if (aAgeDiff < bAgeDiff) return -1;
                if (aAgeDiff > bAgeDiff) return 1;

                // Cuối cùng so sánh theo ID để ổn định
                return Long.compare(a.getId(), b.getId());
            }
        });

        // Bước 3: Lấy ra 3 người đầu tiên (hoặc ít hơn nếu danh sách ngắn)
        List<UserResponse> result = new ArrayList<>();
        int limit = Math.min(size, candidateList.size());
        for (int i = 0; i < limit; i++) {
            User user = candidateList.get(i);
            UserResponse response = userMapper.toUserResponse(user);
            result.add(response);
        }

        return result;
    }

    // Hàm kiểm tra giới tính khác nhau (M ↔ F)
    private boolean isOppositeGender(String g1, String g2) {
        if (g1 == null || g2 == null) return false;
        if (g1.equalsIgnoreCase("M") && g2.equalsIgnoreCase("F")) return true;
        if (g1.equalsIgnoreCase("F") && g2.equalsIgnoreCase("M")) return true;
        return false;
    }

    // Tính độ chênh lệch tuổi (nếu thiếu dữ liệu trả về giá trị lớn)
    private int getAgeDistance(LocalDate yob1, LocalDate yob2) {
        if (yob1 == null || yob2 == null) return 9999;
        int year1 = yob1.getYear();
        int year2 = yob2.getYear();
        return Math.abs(year1 - year2);
    }


    //
    public void lockUser(Long userId, LockUserRequest request, String adminUsername) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User admin = userRepo.getUserByUsername(adminUsername);

        // Không được ban admin khác
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new AppException(ErrorCode.CANNOT_LOCK_ADMIN);
        }

        // Set locked = true
        user.setLocked(true);
        user.setLockedReason(request.getReason());
        user.setLockedDate(LocalDateTime.now());
        user.setLockedUntil(request.getLockedUntil()); // null = vĩnh viễn

        userRepo.save(user);

        String message = "Tài khoản của bạn đã bị khóa. Lý do: " + request.getReason();
        notificationService.notifyAccountLocked(user, admin, message);



    }

    public void unlockUser(Long userId, String adminUsername) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User admin = userRepo.getUserByUsername(adminUsername);

        user.setLocked(false);
        user.setLockedReason(null);
        user.setLockedDate(null);
        user.setLockedUntil(null);

        userRepo.save(user);

        // Gửi notification cho user được mở khóa
        String message = "Tài khoản của bạn đã được mở khóa.";
        notificationService.notifyAccountUnlocked(user, admin, message);


    }

    public List<CommentResponse> getAllComments() {
        return commentRepository.findAll().stream()
                .map(c -> CommentResponse.builder()
                        .id(c.getId())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .userName(c.getUser().getUsername())
                        .imageUrls(c.getImageUrls())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    public List<LikeResponse> getAllLikes() {
        return likeRepo.findAll().stream()
                .map(l -> LikeResponse.builder()
                        .id(l.getId())
                        .title(l.getPost().getTitle())
                        .ownerPost(l.getPost().getUser().getUsername())
                        .createdAt(l.getCreatedAt())
                        .updatedAt(l.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteLike(Long id){
        likeRepo.deleteById(id);
    }

}

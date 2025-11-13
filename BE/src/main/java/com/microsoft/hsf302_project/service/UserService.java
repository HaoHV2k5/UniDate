package com.microsoft.hsf302_project.service;



import com.microsoft.hsf302_project.dto.request.*;

import com.microsoft.hsf302_project.dto.response.*;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.UserMapper;

import com.microsoft.hsf302_project.repo.CommentRepository;
import com.microsoft.hsf302_project.repo.LikeRepo;
import com.microsoft.hsf302_project.repo.UserRepo;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private final CloudinaryService cloudinaryService;

    public List<UserResponse> getAllUsers() {
        List<User> users = userRepo.findAll();
        User admin = userRepo.findUserByRole("ADMIN");
        users.remove(admin);
        return users.stream().map(userMapper::toUserResponse).collect(Collectors.toList());
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

        // Gộp thêm xử lý interests (nếu có truyền lên)
        if (request.getInterests() != null) {
            java.util.Set<String> normalized = request.getInterests().stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(s -> s.trim().toLowerCase())
                    .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
            user.setInterests(normalized);
        }

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
                    // set gender (required by entity)
                    u.setGender(request.getGender() != null ? request.getGender() : "OTHER");
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

        // Chuẩn hoá interests của current user để so khớp chính xác hơn
        Set<String> meInterests = Optional.ofNullable(me.getInterests()).orElseGet(Set::of)
                .stream().filter(Objects::nonNull).map(s -> s.trim().toLowerCase())
                .collect(java.util.stream.Collectors.toSet());

        // 1) Lọc ứng viên hợp lệ (không phải mình, không locked, đã verified, không admin, chưa có quan hệ)
        List<User> candidates = userRepo.findAll().stream()
                .filter(u -> !relatedUsernames.contains(u.getUsername()))
                .filter(u -> !u.isLocked())
                .filter(User::isVerified)
                .filter(u -> u.getRole() == null || !u.getRole().equalsIgnoreCase("ADMIN"))
                .toList();

        // 2) Ưu tiên: khác giới → nhiều sở thích chung → gần tuổi
        Comparator<User> comparator = (a, b) -> {
            boolean aOpp = isOppositeGender(me.getGender(), a.getGender());
            boolean bOpp = isOppositeGender(me.getGender(), b.getGender());
            if (aOpp != bOpp) return aOpp ? -1 : 1; // khác giới trước

            int aCommon = commonInterests(meInterests, a.getInterests());
            int bCommon = commonInterests(meInterests, b.getInterests());
            if (aCommon != bCommon) return Integer.compare(bCommon, aCommon); // common interests desc

            int aAge = getAgeDistance(me.getYob(), a.getYob());
            int bAge = getAgeDistance(me.getYob(), b.getYob());
            if (aAge != bAge) return Integer.compare(aAge, bAge); // age diff asc

            return Long.compare(a.getId(), b.getId());
        };

        // 3) Sắp xếp toàn bộ
        List<User> sorted = new java.util.ArrayList<>(candidates);
        sorted.sort(comparator);

        // 4) Lấy top N (mặc định 3)
        int limit = Math.min(Math.max(size, 1), sorted.size());
        return sorted.subList(0, limit).stream()
                .map(userMapper::toUserResponse)
                .toList();
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
        return Math.abs(yob1.getYear() - yob2.getYear());
    }

    private int commonInterests(Set<String> mine, Set<String> otherRaw) {
        if (mine == null || mine.isEmpty() || otherRaw == null || otherRaw.isEmpty()) return 0;
        Set<String> other = otherRaw.stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toLowerCase())
                .collect(java.util.stream.Collectors.toSet());
        int count = 0;
        for (String s : mine) if (other.contains(s)) count++;
        return count;
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

    public UserResponse updateBio(Long userId, String bio) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setBio(bio);
        User savedUser = userRepo.save(user);
        return userMapper.toUserResponse(savedUser);
    }

    public UserResponse updateAvatar(Long userId, MultipartFile avatar) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        try {
            // Upload lên Cloudinary
            String imageUrl = cloudinaryService.upload(avatar);

            // Cập nhật avatar URL
            user.setAvatar(imageUrl);
            User savedUser = userRepo.save(user);
            return userMapper.toUserResponse(savedUser);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UPLOAD_AVATAR_FAILED);
        }
    }
    public UserResponse updateUserLocation(Long userId, LocationUpdateRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());

        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    public List<NearbyUserResponse> findUsersWithinRadiusKm(Long userId, double radiusKm) {
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (me.getLatitude() == null || me.getLongitude() == null) {
            return List.of();
        }

        double lat1 = me.getLatitude();
        double lon1 = me.getLongitude();

        List<User> usersWithLocation = userRepo.findAll().stream()
                .filter(u -> u.getLatitude() != null && u.getLongitude() != null)
                .filter(u -> !u.getId().equals(userId))
                .toList();

        List<NearbyUserResponse> result = new ArrayList<>();
        for (User u : usersWithLocation) {
            double d = haversineKm(lat1, lon1, u.getLatitude(), u.getLongitude());
            if (d <= radiusKm) {
                double rounded = Math.round(d * 100.0) / 100.0;

                // map User → UserResponse
                UserResponse userResponse = UserResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .fullName(u.getFullName())
                        .gender(u.getGender())
                        .yob(u.getYob())
                        .avatar(u.getAvatar())
                        .address(u.getAddress())
                        .interests(u.getInterests())
                        .latitude(u.getLatitude())
                        .longitude(u.getLongitude())
                        .build();

                result.add(new NearbyUserResponse(userResponse, rounded));
            }
        }

        result.sort(Comparator.comparingDouble(NearbyUserResponse::getDistanceKm));
        return result;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    public List<UserResponse> autocompleteByName(String keyword) {
        List<User> list =  userRepo.findTop10ByFullNameContainingIgnoreCase(keyword);
        User admin = userRepo.findUserByRole("ADMIN");
        list.remove(admin);
        return list.stream().map(userMapper::toUserResponse).collect(Collectors.toList());
    }

    public List<UserResponse> searchByName(String name) {
        List<User> res = userRepo.findByFullNameContainingIgnoreCase(name);
        return res.stream().map(userMapper::toUserResponse).collect(Collectors.toList());
    }
}

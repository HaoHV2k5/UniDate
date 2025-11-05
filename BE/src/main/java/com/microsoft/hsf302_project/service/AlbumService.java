package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.response.RequestAccessResponse;
import com.microsoft.hsf302_project.entity.Album;
import com.microsoft.hsf302_project.entity.AlbumAccessRequest;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.AlbumAccessStatus;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.AlbumAccessRequestMapper;
import com.microsoft.hsf302_project.repo.AlbumRepo;
import com.microsoft.hsf302_project.repo.AlbumAccessRequestRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class AlbumService {
    private final AlbumRepo albumRepo;
    private final AlbumAccessRequestRepo accessRequestRepo;
    private final UserRepo userRepo;
    private final CloudinaryService cloudinaryService;
    private final AlbumAccessRequestMapper albumAccessRequestMapper;
    private final NotificationService notificationService;

    // Upload ảnh vào album cá nhân (userId), trả về url list

    public Album uploadImages(Long userId, List<MultipartFile> files) {
        User user = userRepo.findById(userId).orElseThrow();
        Album album = albumRepo.findByUser(user).orElse(Album.builder().user(user).imageUrls(new ArrayList<>()).build());
        for (MultipartFile file : files) {
            String url = cloudinaryService.upload(file);
            album.getImageUrls().add(url);
        }
        return albumRepo.save(album);
    }

    // Lấy danh sách url ảnh album (chỉ trả về nếu kiểm tra quyền ok)
    public List<String> viewAlbum(Long ownerId, Long requesterId) {
        User owner = userRepo.findById(ownerId).orElseThrow();
        User requester = userRepo.findById(requesterId).orElseThrow();
        if (!owner.getId().equals(requester.getId())) {
            AlbumAccessRequest access = accessRequestRepo.findByRequesterAndOwner(requester, owner)
                .filter(a -> a.getStatus() == AlbumAccessStatus.APPROVED).orElse(null);
            if (access == null) throw new AppException(ErrorCode.NO_PERMISSION_VIEW);
        }
        Album album = albumRepo.findByUser(owner).orElseThrow();
        return album.getImageUrls();
    }

    // Gửi yêu cầu xem album
    public RequestAccessResponse requestAccess(Long ownerId, Long requesterId) {
        User owner = userRepo.findById(ownerId).orElseThrow();
        User requester = userRepo.findById(requesterId).orElseThrow();
        if (accessRequestRepo.findByRequesterAndOwner(requester, owner).isPresent()) {
            throw new AppException(ErrorCode.DUPLICATE_REQUEST_VIEW);
        }
        AlbumAccessRequest request = AlbumAccessRequest.builder()
            .owner(owner)
            .requester(requester)
            .status(AlbumAccessStatus.PENDING)
            .build();
        accessRequestRepo.save(request);
        notificationService.notifyAlbumAccessRequest(owner,requester,"đã nhận yêu cầu quyền xem album mới");
        return albumAccessRequestMapper.toRequestAccessResponse(request);
    }

    // Chủ album duyệt yêu cầu
    public RequestAccessResponse approveRequest(Long requestId, Long ownerId) {
        AlbumAccessRequest request = accessRequestRepo.findById(requestId).orElseThrow();
        if (!request.getOwner().getId().equals(ownerId)) throw new AppException(ErrorCode.NOT_OWNER_ALBUM);
        request.setStatus(AlbumAccessStatus.APPROVED);
         accessRequestRepo.save(request);
        notificationService.notifyRequestAccessAccept(request.getRequester(), request.getOwner(),"bạn đã bị "+request.getOwner().getFullName()+" chấp nhận quyền truy cập album");

         return albumAccessRequestMapper.toRequestAccessResponse(request);
    }

    // Chủ album từ chối yêu cầu
    public void rejectRequest(Long requestId, Long ownerId) {
        AlbumAccessRequest request = accessRequestRepo.findById(requestId).orElseThrow();
        if (!request.getOwner().getId().equals(ownerId)) throw new AppException(ErrorCode.NOT_OWNER_ALBUM);
        albumRepo.deleteById(requestId);
        notificationService.notifyRequestAccessReject(request.getRequester(), request.getOwner(),"bạn đã bị "+request.getOwner().getFullName()+" từ chối quyền truy cập album");

    }


    public Page<RequestAccessResponse> getAlbumRequests(String  username, int page, int size) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AlbumAccessRequest> requests = accessRequestRepo.findByOwnerAndStatus(user, AlbumAccessStatus.PENDING,pageable);

        return requests.map(albumAccessRequestMapper::toRequestAccessResponse);

    }



    public Page<RequestAccessResponse> getAlbumRequestsApproved(String  username, int page, int size) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AlbumAccessRequest> requests = accessRequestRepo.findByOwnerAndStatus(user, AlbumAccessStatus.APPROVED,pageable);

        return requests.map(albumAccessRequestMapper::toRequestAccessResponse);

    }


}

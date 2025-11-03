package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.entity.FriendRequest;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.FriendRequestRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.mapper.UserMapper;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.stream.Stream;

@Service
@RequiredArgsConstructor

public class FriendService {
    private final FriendRequestRepo friendRequestRepo;
    private final UserRepo userRepo;
    private final UserMapper userMapper;

    public void sendFriendRequest(String senderUsername, String receiverUsername) {
        User sender = userRepo.getUserByUsername(senderUsername);
        User receiver = userRepo.getUserByUsername(receiverUsername);
        if (friendRequestRepo.findBySenderAndReceiver(sender, receiver).isPresent()) {
            throw new AppException(ErrorCode.FRIEND_REQUEST_ALREADY_SENT);
        }
        FriendRequest friendRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequest.Status.PENDING)
                .build();
        friendRequestRepo.save(friendRequest);
    }

    public void acceptFriendRequest(String receiverUsername, Long requestId) {
        FriendRequest request = friendRequestRepo.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));
        if (!request.getReceiver().getUsername().equals(receiverUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        request.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepo.save(request);
    }

    public void rejectFriendRequest(String receiverUsername, Long requestId) {
        FriendRequest request = friendRequestRepo.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));
        if (!request.getReceiver().getUsername().equals(receiverUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        request.setStatus(FriendRequest.Status.REJECTED);
        friendRequestRepo.save(request);
    }


    public List<UserResponse> getFriendsByUsername(String username) {
        User user = userRepo.getUserByUsername(username);
        List<FriendRequest> acceptedReceived = friendRequestRepo.findByReceiverAndStatus(user, FriendRequest.Status.ACCEPTED);
        List<FriendRequest> acceptedSent = friendRequestRepo.findBySenderAndStatus(user, FriendRequest.Status.ACCEPTED);
        return userMapper.toUserListResponse(
                Stream.concat(
                        acceptedReceived.stream().map(FriendRequest::getSender),
                        acceptedSent.stream().map(FriendRequest::getReceiver)
                ).distinct().toList()
        );
    }

    public List<UserResponse> getIncomingFriendRequests(String username) {
        User user = userRepo.getUserByUsername(username);
        List<FriendRequest> pending = friendRequestRepo.findByReceiverAndStatus(user, FriendRequest.Status.PENDING);
        return userMapper.toUserListResponse(
                pending.stream().map(FriendRequest::getSender).toList()
        );
    }
}

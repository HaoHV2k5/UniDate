package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.FriendRequest;
import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepo extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequest.Status status);
    List<FriendRequest> findBySenderAndStatus(User sender, FriendRequest.Status status);
    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    Optional<FriendRequest> findByReceiver_UsernameAndSenderId(String receiverUsername, Long senderId);
}

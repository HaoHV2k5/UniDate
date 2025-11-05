package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.AlbumAccessRequest;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.AlbumAccessStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlbumAccessRequestRepo extends JpaRepository<AlbumAccessRequest, Long> {
    Optional<AlbumAccessRequest> findByRequesterAndOwner(User requester, User owner);

    Page<AlbumAccessRequest> findByOwnerAndStatus(User owner, AlbumAccessStatus status, Pageable pageable);
}

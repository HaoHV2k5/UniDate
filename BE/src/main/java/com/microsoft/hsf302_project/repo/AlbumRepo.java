package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Album;
import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AlbumRepo extends JpaRepository<Album, Long> {
    Optional<Album> findByUser(User user);
}

package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterestRepo extends JpaRepository<Interest, Long> {
    Optional<Interest> findByNameIgnoreCase(String name);
    List<Interest> findByCategoryIgnoreCase(String category);
}

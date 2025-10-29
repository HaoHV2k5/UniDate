package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.*;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    @PostMapping("/update/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PostMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Xóa người dùng thành công");
    }

    @PostMapping("/update-password/{id}")
    public ResponseEntity<UserResponse> updatePassword(@PathVariable Long id, @RequestBody UserPasswordUpdateRequest request) {
        return ResponseEntity.ok(userService.updatePassword(id, request));
    }

    @PostMapping("/create-profile/{id}")
    public ResponseEntity<UserResponse> createProfile(@PathVariable Long id, @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.createProfile(id, request));
    }


    //




}

package com.microsoft.hsf302_project.service;



import com.microsoft.hsf302_project.dto.response.UserDetailResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.UserMapper;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor

public class UserService {

        private  final UserRepo userRepo;
        private final UserMapper userMapper;
        public UserDetailResponse findByUsername(String username) {
            User user = userRepo.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return  userMapper.toUserDetailResponse(user);
        }




}

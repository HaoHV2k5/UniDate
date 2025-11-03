package com.microsoft.hsf302_project.mapper;


import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.request.UpdateUserRequest;
import com.microsoft.hsf302_project.dto.response.UserListResponse;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "fullName", target = "fullName")

   UserResponse toUserResponse(User User);

    @Mapping(source = "email", target = "username")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "fullName", target = "fullName")

    User toUser(RegisterRequest request);
    @Mapping(source = "fullName", target = "fullName")
    UserListResponse toUserListResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "verified", ignore = true)
    @Mapping(target = "locked", ignore = true)
    void updateUserFromRequest(UpdateUserRequest request, @MappingTarget User user);

    List<UserResponse> toUserListResponse(List<User> userList);
}

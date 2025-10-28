package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.UserDetailResponse;
import com.microsoft.hsf302_project.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
   UserDetailResponse toUserDetailResponse(User user);
}

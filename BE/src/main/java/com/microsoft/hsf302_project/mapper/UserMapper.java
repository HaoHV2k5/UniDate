package com.microsoft.hsf302_project.mapper;


import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

   UserResponse toUserResponse(User User);
}

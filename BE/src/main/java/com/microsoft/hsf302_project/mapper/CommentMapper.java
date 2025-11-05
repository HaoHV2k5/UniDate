package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.CommentResponse;
import com.microsoft.hsf302_project.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    @Mapping(source = "user.avatar", target = "avatar")
    CommentResponse toCommentResponse(Comment comment);
}

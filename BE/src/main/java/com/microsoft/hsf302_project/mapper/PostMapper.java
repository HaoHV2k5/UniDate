package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PostMapper {
    @Mapping(target = "userId", source = "user.id")
    PostResponse  toPostResponse(Post post);

}


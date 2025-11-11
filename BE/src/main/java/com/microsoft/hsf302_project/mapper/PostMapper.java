package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PostMapper {



    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "dislikeCount", ignore = true)
    PostResponse toPostResponse(Post post);

    @Mapping(target = "imageUrl", ignore = true)
    void updatePost(PostUpdateRequest postUpdateRequest, @MappingTarget Post post);

    List<PostResponse> toListPostResponse(List<Post> posts);
}


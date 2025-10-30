package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PostMapper {

    PostResponse  toPostResponse(Post post);
    void updatePost(PostUpdateRequest postUpdateRequest, @MappingTarget Post post);

    List<PostResponse> toListPostResponse(List<Post> posts);
}


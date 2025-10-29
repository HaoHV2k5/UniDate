package com.microsoft.hsf302_project.mapper;

<<<<<<< HEAD
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
=======
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
<<<<<<< HEAD
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PostMapper {

    PostResponse  toPostResponse(Post post);
    void updatePost(PostUpdateRequest postUpdateRequest, @MappingTarget Post post);

    List<PostResponse> toListPostResponse(List<Post> posts);
=======

@Mapper(componentModel = "spring")
public interface PostMapper {
    @Mapping(target = "userId", source = "user.id")
    PostResponse  toPostResponse(Post post);

>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
}


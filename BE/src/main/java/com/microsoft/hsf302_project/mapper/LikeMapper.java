package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.LikeResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Like;
import com.microsoft.hsf302_project.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LikeMapper {
    @Mapping(source = "user.username", target = "ownerPost")
    @Mapping(source = "post.title", target = "title")
    LikeResponse toLikeResponse(Like like);
    List<LikeResponse> toLikeResponseList(List<Like> likes);


}

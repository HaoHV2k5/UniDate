package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.RequestAccessResponse;
import com.microsoft.hsf302_project.entity.AlbumAccessRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlbumAccessRequestMapper {

    @Mapping(target = "status" , expression = "java(albumAccessRequest.getStatus().name())")

    RequestAccessResponse toRequestAccessResponse(AlbumAccessRequest albumAccessRequest);
}

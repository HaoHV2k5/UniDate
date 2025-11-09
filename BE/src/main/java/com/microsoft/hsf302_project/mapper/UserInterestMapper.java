package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.UserInterestResponse;
import com.microsoft.hsf302_project.entity.UserInterest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserInterestMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "interest.id", target = "interestId")
    @Mapping(source = "interest.name", target = "interestName")
    @Mapping(source = "interest.category", target = "category")
    UserInterestResponse toUserInterestResponse(UserInterest userInterest);

    List<UserInterestResponse> toUserInterestResponseList(List<UserInterest> list);
}

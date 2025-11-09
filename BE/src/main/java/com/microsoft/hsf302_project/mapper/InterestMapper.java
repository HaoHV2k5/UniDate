package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.request.InterestRequest;
import com.microsoft.hsf302_project.dto.response.InterestResponse;
import com.microsoft.hsf302_project.entity.Interest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InterestMapper {

    InterestResponse toInterestResponse(Interest interest);
    List<InterestResponse> toInterestResponseList(List<Interest> interests);

    Interest toInterest(InterestRequest request);
}

package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.NotificationResponse;
import com.microsoft.hsf302_project.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(source = "triggerBy.id", target = "triggerById")
    @Mapping(source = "triggerBy.fullName", target = "triggerByName")
    NotificationResponse toNotificationResponse(Notification notification);
}

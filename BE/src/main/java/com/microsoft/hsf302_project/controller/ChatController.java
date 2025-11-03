package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.ChatMessageRequest;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.message.SimpleMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserService userService;

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessageRequest chatMessageRequest, Principal principal) {
        log.warn(principal.getName());
        String toUser = chatMessageRequest.getTo().trim();
        UserResponse user = userService.getUserById(Long.valueOf(toUser));
        if(principal != null) {
            chatMessageRequest.setSender(principal.getName());
        }
        log.warn("đã guiwr");
        System.out.println("📨 Received message from: " + principal.getName());
        System.out.println("📨 Message content: " + chatMessageRequest.getContent());
        System.out.println("📨 Sending to user: " + chatMessageRequest.getTo());
        simpMessagingTemplate.convertAndSendToUser("magicmath2k5@gmail.com", "/queue/private", chatMessageRequest);

    }

}

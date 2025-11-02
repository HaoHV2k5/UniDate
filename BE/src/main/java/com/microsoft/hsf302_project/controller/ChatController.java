package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.ChatMessageRequest;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.message.SimpleMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessageRequest chatMessageRequest, Principal principal) {
        String toUser = chatMessageRequest.getTo();
        if(principal != null) {
            chatMessageRequest.setSender(principal.getName());
        }
        simpMessagingTemplate.convertAndSendToUser(toUser, "/private", chatMessageRequest);
    }

}

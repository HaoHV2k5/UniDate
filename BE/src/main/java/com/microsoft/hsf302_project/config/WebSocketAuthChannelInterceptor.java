package com.microsoft.hsf302_project.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder; // Bean từ SecurityConfig

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Lấy Authorization header
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders == null || authHeaders.isEmpty()) {
                System.out.println("❌ No Authorization header in STOMP CONNECT");
                return message; // hoặc throw nếu muốn chặn
            }

            String raw = authHeaders.get(0);
            if (raw == null || !raw.startsWith("Bearer ")) {
                System.out.println("❌ Invalid Authorization header format");
                return message;
            }

            String token = raw.substring(7);

            try {
                Jwt jwt = jwtDecoder.decode(token);
                String username = jwt.getSubject();
                String role = (String) jwt.getClaims().get("scope"); // scope là chuỗi đơn

                // Tạo Authentication
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
                Authentication auth = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.singletonList(authority)
                );

                accessor.setUser(auth);
                System.out.println("✅ WebSocket authenticated user: " + username + " (" + role + ")");
            } catch (Exception e) {
                System.out.println("❌ WebSocket token decode failed: " + e.getMessage());
                // Nếu bạn muốn chặn connect khi token lỗi:
                // throw new IllegalArgumentException("Invalid JWT token");
            }
        }

        return message;
    }
}

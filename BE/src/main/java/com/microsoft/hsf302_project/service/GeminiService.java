package com.microsoft.hsf302_project.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.UserMatchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeminiService {
    private final ChatModel chatModel;
    public List<UserResponse> suggestMatch(UserResponse mainActor, List<UserResponse> candidateActors) {
        String prompt = buildPrompt(mainActor, candidateActors);
        ChatResponse response = chatModel.call(new Prompt(prompt));
        String jsonText = response.getResult().getOutput().getText().trim();

        String cleanedOutput = jsonText
                .replaceAll("(?i)```json", "")
                .replaceAll("```", "")
                .trim();

        ObjectMapper mapper = new ObjectMapper();
        try {
            // Bước 1: parse kết quả từ AI
            List<UserMatchResponse> matches = mapper.readValue(cleanedOutput,
                    new TypeReference<List<UserMatchResponse>>() {});

            // Bước 2: gán điểm score vào danh sách user gốc
            for (UserResponse user : candidateActors) {
                matches.stream()
                        .filter(m -> m.getName().equalsIgnoreCase(user.getFullName()))
                        .findFirst()
                        .ifPresent(matched -> {user.setScore(matched.getMatchScore());
                                user.setReason(matched.getReason());});
            }

            // Bước 3: sắp xếp theo điểm giảm dần
            return candidateActors.stream()
                    .sorted(Comparator.comparingDouble(UserResponse::getScore).reversed())
                    .limit(3)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi phân tích kết quả AI: " + cleanedOutput, e);
        }
    }


    private String buildPrompt(UserResponse mainActor, List<UserResponse> candidateActors) {
        StringBuilder sb = new StringBuilder();

        sb.append("Bạn là một hệ thống AI chuyên đánh giá độ phù hợp giữa con người.\n");
        sb.append("Dữ liệu đầu vào gồm một người dùng chính (target user) và danh sách các ứng viên.\n");
        sb.append("Hãy phân tích dựa trên sở thích, tính cách, độ tuổi và giới tính.\n");


        // User chính

        sb.append("Người dùng chính:\n");
        sb.append(String.format("""
        - Tên: %s
        - Tuổi: %d
        - Giới tính: %s
        - Sở thích: %s
        """,
               mainActor.getFullName(),  LocalDate.now().getYear() - mainActor.getYob().getYear(), mainActor.getGender(), String.join(", ", mainActor.getInterests())
        ));

        // Danh sách ứng viên
        sb.append("\nDanh sách ứng viên:\n");
        int i = 1;
        for (UserResponse u : candidateActors) {
            sb.append(String.format("""
            Ứng viên %d:
            - Tên: %s
            - Tuổi: %d
            - Giới tính: %s
            - Sở thích: %s

            """,
                    i++, u.getFullName(),  LocalDate.now().getYear() - u.getYob().getYear(), u.getGender(), String.join(", ", u.getInterests())
            ));
        }

        sb.append("""
        Yêu cầu:
        - Phân tích mức độ tương đồng giữa người dùng chính và từng ứng viên.
        - Đánh giá dựa trên:
          + Sở thích trùng nhau
          + Tính cách tương hợp
          + Chênh lệch tuổi hợp lý
        - Kết quả trả về là JSON  sắp xếp theo điểm phù hợp giảm dần.
        - Mỗi phần tử có cấu trúc:
          {
            "name": "<tên ứng viên>",
            "matchScore": <điểm số từ 0 đến 100>,
            "reason": "<lý do ngắn gọn>",
            
          }
        - Không thêm ký tự thừa ngoài JSON.
        """);

        return sb.toString();
    }

}

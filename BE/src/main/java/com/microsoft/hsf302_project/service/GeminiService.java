package com.microsoft.hsf302_project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiService {
    private final ChatModel chatModel;

//    public PriceSuggestionResponse suggestPrice(PriceRequest request) {
//        String prompt = buildPrompt(request);
//
//        ChatResponse response = chatModel.call(new Prompt(prompt));
//        String jsonText = response.getResult().getOutput().getText().trim();
//
//        // Làm sạch output
//        String cleanedOutput = jsonText
//                .replaceAll("(?i)```json", "") // không phân biệt chữ hoa và chữ thường
//                .replaceAll("```", "")
//                .trim();
//
//        try {
//            ObjectMapper mapper = new ObjectMapper();
//            // Parse từ cleanedOutput, không phải jsonText
//            return mapper.readValue(cleanedOutput, PriceSuggestionResponse.class);
//        } catch (Exception e) {
//            throw new RuntimeException("Lỗi khi phân tích kết quả AI: " + cleanedOutput, e);
//        }
//    }
//
//
//    private String buildPrompt(PriceRequest r) {
//        StringBuilder sb = new StringBuilder();
//
//        sb.append("Bạn là một hệ thống gợi ý giá sản phẩm.\n");
//        sb.append("Loại sản phẩm: ").append(r.getType()).append("\n");
//
//        if ("vehicle".equalsIgnoreCase(r.getType())) {
//            sb.append(String.format("""
//                Thông tin xe điện:
//                - Hãng: %s
//                - Mẫu: %s
//                - Năm sản xuất: %d
//                - Số km đã đi: %d km
//                - Loại pin: %s
//                - Dung lượng pin: %.1f kWh
//                - Quãng đường mỗi lần sạc: %d km
//                """,
//                    r.getBrand(), r.getModel(), r.getYearManufactured(),
//                    r.getOdometer(), r.getBatteryType(),
//                    r.getBatteryCapacityKWh(), r.getRangePerChargeKm()
//            ));
//        } else {
//            sb.append(String.format("""
//                Thông tin pin điện:
//                - Hãng: %s
//                - Mẫu: %s
//                - Năm sản xuất: %d
//                - Loại pin: %s
//                - Mức pin hiện tại: %d%%
//                - Điện áp danh định: %.1f V
//                - Dung lượng: %.1f Ah
//                - SoH: %d%%
//                """,
//                    r.getBrand(), r.getModel(), r.getYearManufactured(),
//                    r.getBatteryType(), r.getBatteryLevel(),
//                    r.getVoltage(), r.getCapacityAh(), r.getSohPercent()
//            ));
//        }
//
//
//        sb.append("""
//            Yêu cầu:
//            - Gợi ý giá hợp lý, tối đa 20.000.000 VND.
//            - Phân tích dựa trên thông tin kỹ thuật và mô tả thực tế.
//            - source thì đưa các đường link dẫn chứng
//            - descript thì ngắn gọn nhất có thể
//            - Trả về JSON có 3 trường:
//              {
//                "suggestedPrice": <giá (số nguyên)>,
//                "reason": "<lý do ngắn gọn>",
//                "source": "<nguồn tham khảo hoặc căn cứ>",
//                "description": <thông tin chi tiết về lí do chọn>
//              }
//            - Không thêm ký tự thừa ngoài JSON.
//            """);
//
//        return sb.toString();
//    }
}

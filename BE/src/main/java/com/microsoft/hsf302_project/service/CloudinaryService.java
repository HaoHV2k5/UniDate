    package com.microsoft.hsf302_project.service;

    import com.cloudinary.Cloudinary;
    import com.cloudinary.utils.ObjectUtils;
    import lombok.RequiredArgsConstructor;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Service;
    import org.springframework.web.multipart.MultipartFile;

    import java.io.IOException;
    import java.util.Map;

    @Service
    @RequiredArgsConstructor
    public class CloudinaryService {

        @Value("${cloudinary.cloud_name}")
        private String cloudName;
        @Value("${cloudinary.api_key}")
        private String apiKey;
        @Value("${cloudinary.api_secret}")
        private String apiSecret;

        private Cloudinary buildClient(){
            return new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret));
        }

        public String upload(MultipartFile file) {
            try {
                Map uploadResult = buildClient().uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                return (String) uploadResult.get("secure_url");
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to upload to Cloudinary", e);
            }
        }
    }



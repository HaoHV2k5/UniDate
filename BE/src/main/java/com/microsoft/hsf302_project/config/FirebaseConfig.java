package com.microsoft.hsf302_project.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void init() throws IOException {
        String defaultPath = "src/main/resources/unidate-2830e-firebase-adminsdk-fbsvc-b2820e2201.json";
        File file = new File(defaultPath);
        if (!file.exists()) {
            System.out.println("[Firebase] Service account JSON not found. Skipping Firebase initialization.");
            return; // allow app to start without Firebase locally
        }

        try (FileInputStream serviceAccount = new FileInputStream(file)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("[Firebase] Initialized successfully.");
            }
        }
    }
}

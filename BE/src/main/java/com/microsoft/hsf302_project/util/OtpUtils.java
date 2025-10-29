package com.microsoft.hsf302_project.util;

import java.security.SecureRandom;

public final class OtpUtils {
    private static final SecureRandom RANDOM = new SecureRandom();
    private OtpUtils(){}

    public static String random6Digits() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }

    public static String maskEmailLikeUsername(String usernameEmail) {
        if (usernameEmail == null || !usernameEmail.contains("@")) return usernameEmail;
        String[] parts = usernameEmail.split("@", 2);
        String local = parts[0];
        if (local.length() <= 2) return "***@" + parts[1];
        return local.charAt(0) + "***" + local.charAt(local.length()-1) + "@" + parts[1];
    }
}

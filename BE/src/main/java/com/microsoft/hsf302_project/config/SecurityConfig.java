package com.microsoft.hsf302_project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    @Value("${jwt.secret}")
    private String secretKey;

    private static final String[] WHITE_LIST = {
            "/api/auth/**",
            "/users/register",
            "/api/verify-otp",
            "/api/resend-otp",
            "/tag/**",
            "/api/users/forgot-password",
            "/api/users/reset-password",
            "/api/payment/vnpay-return",
            "/api/payment/create",
            "https://freddie-forestial-tiny.ngrok-free.dev/api/payment/ipn",
            "/api/post/**"
    };
    

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {//cogig chặn quyền truy cập ai mới có được quyền dùng
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(request -> request.requestMatchers(WHITE_LIST).permitAll()
                        .requestMatchers("/api/payment/payment-return", "/api/payment/callback").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"products").permitAll()
                        .requestMatchers("/ws/**", "/topic/**", "/app/**").permitAll()
                        .requestMatchers("/api/eversign/webhook").permitAll()
                        .requestMatchers("/ws").permitAll()
                        .anyRequest().authenticated()   
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(  jwtDecoder() ).jwtAuthenticationConverter(jwtAuthenticationConverter())))
//                .oauth2Login(oauth2 ->
//                        oauth2      //.defaultSuccessUrl("/oauth2/success",true)
//                                .failureUrl("/login?error")
//                                .redirectionEndpoint(redir -> redir.baseUri("/login/oauth2/code/*"))
//                                .successHandler((HttpServletRequest request, HttpServletResponse response, Authentication authentication) -> {
//                                    System.out.println("=== OAuth2 Success Handler Called ===");
//                                    System.out.println(" o trong security config Authentication: " + authentication);
//                                    response.sendRedirect("/oauth2/success");
//                                }))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        ;



        return http.build();
    }

    public JwtAuthenticationConverter jwtAuthenticationConverter(){
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

@Bean
    public JwtDecoder  jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(),"HS512");
        return NimbusJwtDecoder.withSecretKey(secretKeySpec).macAlgorithm(MacAlgorithm.HS512).build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép FE localhost và domain ngrok
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:3979",
                "https://*.ngrok-free.dev"
        ));

        // Các method được phép
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Cho phép mọi header
        configuration.addAllowedHeader("*");

        // Cho phép cookie/session gửi kèm
        configuration.setAllowCredentials(true);

        // Nếu muốn, có thể set expose headers (vd: Authorization)
        configuration.addExposedHeader("Authorization");

        // Áp dụng cho toàn bộ route
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

//@Bean
//public CorsConfigurationSource corsConfigurationSource() {
//    CorsConfiguration configuration = new CorsConfiguration();
//    configuration.setAllowedOrigins(Arrays.asList(
//            "http://localhost:5173",
//            "http://localhost:3000",
//            "https://freddie-forestial-tiny.ngrok-free.dev",
//            "https://unidate.vercel.app" // nếu FE deploy trên Vercel
//    ));
//    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//    configuration.addAllowedHeader("*");
//    configuration.setAllowCredentials(true); // ⚠️ cần dòng này
//
//    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//    source.registerCorsConfiguration("/**", configuration);
//    return source;
//}


}

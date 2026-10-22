package com.example.cms.auth;

import com.example.cms.users.Role;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String avatarUrl;
        private List<String> roles;
        private boolean isEmailVerified;
    }
}
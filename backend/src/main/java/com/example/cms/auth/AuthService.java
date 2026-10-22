package com.example.cms.auth;

import com.example.cms.common.ApiResponse;
import com.example.cms.security.JwtTokenProvider;
import com.example.cms.security.UserDetailsServiceImpl;
import com.example.cms.security.UserPrincipal;
import com.example.cms.users.Role;
import com.example.cms.users.RoleRepository;
import com.example.cms.users.User;
import com.example.cms.users.UserRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Validated
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.from}")
    private String emailFrom;

    @Transactional
    public AuthResponse register(@Valid RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .isActive(true)
                .isEmailVerified(false)
                .emailVerificationToken(UUID.randomUUID().toString())
                .emailVerificationExpiresAt(Instant.now().plusSeconds(86400)) // 24 hours
                .build();

        // Assign STUDENT role by default
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new IllegalStateException("STUDENT role not found"));
        user.getRoles().add(studentRole);

        user = userRepository.save(user);

        // Send verification email
        sendVerificationEmail(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(@Valid LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findByEmail(userPrincipal.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Update last login
        user.setLastLoginAt(Instant.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }

    public void forgotPassword(@Valid ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPasswordResetToken(UUID.randomUUID().toString());
            user.setPasswordResetExpiresAt(Instant.now().plusSeconds(3600)); // 1 hour
            userRepository.save(user);
            sendPasswordResetEmail(user);
        }
        // Always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(@Valid ResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken, userDetailsService.loadUserByUsername(jwtTokenProvider.extractUsername(refreshToken)))) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String username = jwtTokenProvider.extractUsername(refreshToken);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newAccessToken = jwtTokenProvider.generateToken(userDetailsService.loadUserByUsername(username));
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetailsService.loadUserByUsername(username));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .user(buildUserInfo(user))
                .build();
    }

    public AuthResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return buildAuthResponse(user);
    }

    @Transactional
    public User updateProfile(UUID userId, String firstName, String lastName, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt() == null || user.getEmailVerificationExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        user.setIsEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateToken(userDetailsService.loadUserByUsername(user.getEmail()));
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetailsService.loadUserByUsername(user.getEmail()));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .user(buildUserInfo(user))
                .build();
    }

    private AuthResponse.UserInfo buildUserInfo(User user) {
        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .isEmailVerified(user.getIsEmailVerified())
                .build();
    }

    private void sendVerificationEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(emailFrom);
            helper.setTo(user.getEmail());
            helper.setSubject("Verify your email - Course Management System");

            String verificationUrl = frontendUrl + "/verify-email?token=" + user.getEmailVerificationToken();
            String content = String.format("""
                    <html>
                    <body>
                        <h2>Welcome to Course Management System!</h2>
                        <p>Hi %s,</p>
                        <p>Please click the link below to verify your email address:</p>
                        <p><a href="%s">Verify Email</a></p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </body>
                    </html>
                    """, user.getFirstName(), verificationUrl);

            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", user.getEmail(), e);
        }
    }

    private void sendPasswordResetEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(emailFrom);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset - Course Management System");

            String resetUrl = frontendUrl + "/reset-password?token=" + user.getPasswordResetToken();
            String content = String.format("""
                    <html>
                    <body>
                        <h2>Password Reset Request</h2>
                        <p>Hi %s,</p>
                        <p>You requested a password reset. Click the link below to reset your password:</p>
                        <p><a href="%s">Reset Password</a></p>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </body>
                    </html>
                    """, user.getFirstName(), resetUrl);

            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", user.getEmail(), e);
        }
    }
}
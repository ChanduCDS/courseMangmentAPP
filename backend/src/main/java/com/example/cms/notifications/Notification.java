package com.example.cms.notifications;

import com.example.cms.common.BaseEntity;
import com.example.cms.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 50)
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotBlank
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Size(max = 50)
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @NotBlank
    @Size(max = 20)
    @Builder.Default
    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "NORMAL";

    @Size(max = 500)
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Size(max = 100)
    @Column(name = "action_label", length = 100)
    private String actionLabel;

    @Column(name = "expires_at")
    private Instant expiresAt;
}

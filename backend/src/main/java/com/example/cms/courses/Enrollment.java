package com.example.cms.courses;

import com.example.cms.common.BaseEntity;
import com.example.cms.users.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @NotBlank
    @Size(max = 20)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "enrolled_at", nullable = false)
    @Builder.Default
    private Instant enrolledAt = Instant.now();

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @DecimalMin("0.00")
    @Digits(integer = 3, fraction = 2)
    @Column(name = "progress_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Size(max = 10)
    @Column(name = "final_grade")
    private String finalGrade;

    @Column(name = "certificate_issued", nullable = false)
    @Builder.Default
    private Boolean certificateIssued = false;

    @Column(name = "certificate_issued_at")
    private Instant certificateIssuedAt;

    @Size(max = 500)
    @Column(name = "certificate_url")
    private String certificateUrl;

    @NotBlank
    @Size(max = 20)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private String paymentStatus = "NOT_REQUIRED";

    @Digits(integer = 10, fraction = 2)
    @Column(name = "payment_amount", precision = 12, scale = 2)
    private BigDecimal paymentAmount;

    @Size(min = 3, max = 3)
    @Column(name = "payment_currency")
    @Builder.Default
    private String paymentCurrency = "USD";

    @Size(max = 255)
    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
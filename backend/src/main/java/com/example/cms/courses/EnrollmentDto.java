package com.example.cms.courses;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDto {

    private UUID id;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private UUID courseId;
    private String courseTitle;
    private String courseCode;
    private String courseThumbnailUrl;
    private String status;
    private Instant enrolledAt;
    private Instant confirmedAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant cancelledAt;
    private String cancellationReason;
    private BigDecimal progressPercentage;
    private String finalGrade;
    private Boolean certificateIssued;
    private Instant certificateIssuedAt;
    private String certificateUrl;
    private String paymentStatus;
    private BigDecimal paymentAmount;
    private String paymentCurrency;
    private String paymentReference;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
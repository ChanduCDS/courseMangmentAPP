package com.example.cms.courses;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseUpdateRequest {

    @Size(max = 255)
    private String title;

    @Size(max = 50)
    private String courseCode;

    @Size(max = 500)
    private String shortDescription;

    private String fullDescription;

    private UUID categoryId;

    @Size(max = 500)
    private String thumbnailUrl;

    @Min(0)
    private Integer duration;

    @Size(max = 20)
    private String durationUnit;

    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal fee;

    @Size(min = 3, max = 3)
    private String currency;

    @Size(max = 20)
    private String difficultyLevel;

    @Min(1)
    private Integer enrollmentCapacity;

    private Instant enrollmentStartDate;

    private Instant enrollmentEndDate;

    private Instant courseStartDate;

    private Instant courseEndDate;

    private Boolean isFeatured;

    @Size(max = 255)
    private String metaTitle;

    @Size(max = 500)
    private String metaDescription;

    @Size(max = 500)
    private String metaKeywords;

    private List<UUID> instructorIds;
}
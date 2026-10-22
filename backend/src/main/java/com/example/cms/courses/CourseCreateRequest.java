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
public class CourseCreateRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 50)
    private String courseCode;

    @Size(max = 500)
    private String shortDescription;

    private String fullDescription;

    @NotNull
    private UUID categoryId;

    @Size(max = 500)
    private String thumbnailUrl;

    @Min(0)
    @Builder.Default
    private Integer duration = 0;

    @NotBlank
    @Size(max = 20)
    @Builder.Default
    private String durationUnit = "HOURS";

    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @NotBlank
    @Size(min = 3, max = 3)
    @Builder.Default
    private String currency = "USD";

    @NotBlank
    @Size(max = 20)
    @Builder.Default
    private String difficultyLevel = "BEGINNER";

    @Min(1)
    private Integer enrollmentCapacity;

    private Instant enrollmentStartDate;

    private Instant enrollmentEndDate;

    private Instant courseStartDate;

    private Instant courseEndDate;

    @Builder.Default
    private Boolean isFeatured = false;

    @Size(max = 255)
    private String metaTitle;

    @Size(max = 500)
    private String metaDescription;

    @Size(max = 500)
    private String metaKeywords;

    private List<UUID> instructorIds;
}
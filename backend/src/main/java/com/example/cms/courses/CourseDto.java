package com.example.cms.courses;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {

    private UUID id;
    private String title;
    private String courseCode;
    private String shortDescription;
    private String fullDescription;
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private String thumbnailUrl;
    private Integer duration;
    private String durationUnit;
    private BigDecimal fee;
    private String currency;
    private String difficultyLevel;
    private String status;
    private Integer enrollmentCapacity;
    private Instant enrollmentStartDate;
    private Instant enrollmentEndDate;
    private Instant courseStartDate;
    private Instant courseEndDate;
    private Boolean isFeatured;
    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;
    private Integer enrollmentCount;
    private Boolean isEnrollmentOpen;
    private List<UUID> instructorIds;
    private List<String> instructorNames;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant publishedAt;
    private Instant archivedAt;
}
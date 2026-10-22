package com.example.cms.courses;

import com.example.cms.common.BaseEntity;
import com.example.cms.categories.Category;
import com.example.cms.users.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Size(max = 50)
    @Column(name = "course_code", nullable = false, unique = true)
    private String courseCode;

    @Size(max = 500)
    @Column(name = "short_description")
    private String shortDescription;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Size(max = 500)
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Min(0)
    @Column(name = "duration", nullable = false)
    @Builder.Default
    private Integer duration = 0;

    @NotBlank
    @Size(max = 20)
    @Column(name = "duration_unit", nullable = false)
    @Builder.Default
    private String durationUnit = "HOURS";

    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @NotBlank
    @Size(min = 3, max = 3)
    @Column(name = "currency", nullable = false)
    @Builder.Default
    private String currency = "USD";

    @NotBlank
    @Size(max = 20)
    @Column(name = "difficulty_level", nullable = false)
    @Builder.Default
    private String difficultyLevel = "BEGINNER";

    @NotBlank
    @Size(max = 20)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @Min(1)
    @Column(name = "enrollment_capacity")
    private Integer enrollmentCapacity;

    @Column(name = "enrollment_start_date")
    private Instant enrollmentStartDate;

    @Column(name = "enrollment_end_date")
    private Instant enrollmentEndDate;

    @Column(name = "course_start_date")
    private Instant courseStartDate;

    @Column(name = "course_end_date")
    private Instant courseEndDate;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Size(max = 255)
    @Column(name = "meta_title")
    private String metaTitle;

    @Size(max = 500)
    @Column(name = "meta_description")
    private String metaDescription;

    @Size(max = 500)
    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_instructors",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "instructor_id")
    )
    @Builder.Default
    private Set<User> instructors = new HashSet<>();

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Enrollment> enrollments = new HashSet<>();

    @Transient
    public Integer getEnrollmentCount() {
        return enrollments != null ? enrollments.size() : 0;
    }

    @Transient
    public boolean isPublished() {
        return "PUBLISHED".equals(status);
    }

    @Transient
    public boolean isEnrollmentOpen() {
        Instant now = Instant.now();
        if (enrollmentStartDate != null && now.isBefore(enrollmentStartDate)) {
            return false;
        }
        if (enrollmentEndDate != null && now.isAfter(enrollmentEndDate)) {
            return false;
        }
        if (enrollmentCapacity != null && getEnrollmentCount() >= enrollmentCapacity) {
            return false;
        }
        return isPublished();
    }
}
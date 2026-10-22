package com.example.cms.dashboard;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {

    private long totalCourses;
    private long publishedCourses;
    private long draftCourses;
    private long inactiveCourses;
    private long archivedCourses;
    private long totalStudents;
    private long totalInstructors;
    private long activeEnrollments;
    private List<MonthlyStatDto> enrollmentTrend;
    private List<CategoryStatDto> categoryDistribution;
    private List<PopularCourseDto> popularCourses;
    private List<RecentEnrollmentDto> recentEnrollments;
    private List<RecentCourseDto> recentCourseUpdates;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MonthlyStatDto {
    private String month;
    private long count;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CategoryStatDto {
    private UUID categoryId;
    private String categoryName;
    private String categoryColor;
    private long courseCount;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PopularCourseDto {
    private UUID courseId;
    private String courseTitle;
    private String courseCode;
    private long enrollmentCount;
    private BigDecimal revenue;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class RecentEnrollmentDto {
    private UUID enrollmentId;
    private UUID studentId;
    private String studentName;
    private UUID courseId;
    private String courseTitle;
    private String status;
    private Instant enrolledAt;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class RecentCourseDto {
    private UUID courseId;
    private String courseTitle;
    private String courseCode;
    private String status;
    private Instant updatedAt;
    private String updatedBy;
}
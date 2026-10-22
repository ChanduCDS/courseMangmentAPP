package com.example.cms.dashboard;

import com.example.cms.courses.Course;
import com.example.cms.courses.CourseDto;
import com.example.cms.courses.EnrollmentDto;
import com.example.cms.courses.CourseRepository;
import com.example.cms.courses.EnrollmentRepository;
import com.example.cms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdminDashboardDto getAdminDashboard() {
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByStatus("PUBLISHED");
        long draftCourses = courseRepository.countByStatus("DRAFT");
        long inactiveCourses = courseRepository.countByStatus("INACTIVE");
        long archivedCourses = courseRepository.countByStatus("ARCHIVED");

        long totalStudents = userRepository.findActiveUsersByRole("STUDENT").size();
        long totalInstructors = userRepository.findActiveUsersByRole("INSTRUCTOR").size();

        long activeEnrollments = enrollmentRepository.findByStatusIn(List.of("ENROLLED", "IN_PROGRESS")).size();

        // Enrollment trend (last 12 months)
        List<MonthlyStatDto> enrollmentTrend = getEnrollmentTrend(12);

        // Category distribution
        List<CategoryStatDto> categoryDistribution = getCategoryDistribution();

        // Popular courses
        List<PopularCourseDto> popularCourses = getPopularCourses(5);

        // Recent enrollments
        List<RecentEnrollmentDto> recentEnrollments = getRecentEnrollments(10);

        // Recent course updates
        List<RecentCourseDto> recentCourseUpdates = getRecentCourseUpdates(10);

        return AdminDashboardDto.builder()
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .draftCourses(draftCourses)
                .inactiveCourses(inactiveCourses)
                .archivedCourses(archivedCourses)
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .activeEnrollments(activeEnrollments)
                .enrollmentTrend(enrollmentTrend)
                .categoryDistribution(categoryDistribution)
                .popularCourses(popularCourses)
                .recentEnrollments(recentEnrollments)
                .recentCourseUpdates(recentCourseUpdates)
                .build();
    }

    public InstructorDashboardDto getInstructorDashboard(UUID instructorId) {
        // Get courses assigned to instructor
        List<CourseDto> assignedCourses = courseRepository
                .findByStatusAndInstructorId("PUBLISHED", instructorId,
                        org.springframework.data.domain.Pageable.unpaged())
                .getContent()
                .stream()
                .map(this::toCourseDto)
                .toList();

        long totalAssignedCourses = assignedCourses.size();
        long totalEnrolledStudents = 0;

        List<CourseEnrollmentStatDto> courseStats = new ArrayList<>();

        for (CourseDto course : assignedCourses) {
            long enrolledCount = enrollmentRepository.countActiveEnrollmentsByCourseId(course.getId());
            totalEnrolledStudents += enrolledCount;

            courseStats.add(CourseEnrollmentStatDto.builder()
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .courseCode(course.getCourseCode())
                    .enrolledStudents(enrolledCount)
                    .capacity(course.getEnrollmentCapacity())
                    .build());
        }

        // Recent enrollments in assigned courses
        List<RecentEnrollmentDto> recentEnrollments = getRecentEnrollmentsForInstructor(instructorId, 10);

        return InstructorDashboardDto.builder()
                .totalAssignedCourses(totalAssignedCourses)
                .totalEnrolledStudents(totalEnrolledStudents)
                .courseStats(courseStats)
                .recentEnrollments(recentEnrollments)
                .build();
    }

    public StudentDashboardDto getStudentDashboard(UUID studentId) {
        // Get student enrollments
        List<EnrollmentDto> enrollments = enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::toEnrollmentDto)
                .toList();

        long enrolledCourses = enrollments.stream()
                .filter(e -> List.of("ENROLLED", "IN_PROGRESS").contains(e.getStatus()))
                .count();
        long inProgressCourses = enrollments.stream()
                .filter(e -> "IN_PROGRESS".equals(e.getStatus()))
                .count();
        long completedCourses = enrollments.stream()
                .filter(e -> "COMPLETED".equals(e.getStatus()))
                .count();

        // Recommended courses (published courses not enrolled in)
        List<CourseDto> recommendedCourses = getRecommendedCourses(studentId, 5);

        // Recent notifications would come from notification service

        return StudentDashboardDto.builder()
                .enrolledCourses(enrolledCourses)
                .inProgressCourses(inProgressCourses)
                .completedCourses(completedCourses)
                .enrollments(enrollments)
                .recommendedCourses(recommendedCourses)
                .build();
    }

    private List<MonthlyStatDto> getEnrollmentTrend(int months) {
        List<MonthlyStatDto> trend = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            Instant start = monthStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant end = monthEnd.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

            // This would need a custom query in the repository
            long count = 0; // enrollmentRepository.countByEnrolledAtBetween(start, end);

            trend.add(MonthlyStatDto.builder()
                    .month(monthStart.getMonth().name().substring(0, 3) + " " + monthStart.getYear())
                    .count(count)
                    .build());
        }

        return trend;
    }

    private List<CategoryStatDto> getCategoryDistribution() {
        // This would need a custom query
        return List.of();
    }

    private List<PopularCourseDto> getPopularCourses(int limit) {
        // This would need a custom query
        return List.of();
    }

    private List<RecentEnrollmentDto> getRecentEnrollments(int limit) {
        // This would need a custom query
        return List.of();
    }

    private List<RecentCourseDto> getRecentCourseUpdates(int limit) {
        // This would need a custom query
        return List.of();
    }

    private List<RecentEnrollmentDto> getRecentEnrollmentsForInstructor(UUID instructorId, int limit) {
        // This would need a custom query
        return List.of();
    }

    private List<CourseDto> getRecommendedCourses(UUID studentId, int limit) {
        // This would need a custom query
        return List.of();
    }

    private CourseDto toCourseDto(Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .courseCode(course.getCourseCode())
                .shortDescription(course.getShortDescription())
                .fullDescription(course.getFullDescription())
                .categoryId(course.getCategory() != null ? course.getCategory().getId() : null)
                .categoryName(course.getCategory() != null ? course.getCategory().getName() : null)
                .categoryIcon(course.getCategory() != null ? course.getCategory().getIcon() : null)
                .categoryColor(course.getCategory() != null ? course.getCategory().getColor() : null)
                .thumbnailUrl(course.getThumbnailUrl())
                .duration(course.getDuration())
                .durationUnit(course.getDurationUnit())
                .fee(course.getFee())
                .currency(course.getCurrency())
                .difficultyLevel(course.getDifficultyLevel())
                .status(course.getStatus())
                .enrollmentCapacity(course.getEnrollmentCapacity())
                .enrollmentStartDate(course.getEnrollmentStartDate())
                .enrollmentEndDate(course.getEnrollmentEndDate())
                .courseStartDate(course.getCourseStartDate())
                .courseEndDate(course.getCourseEndDate())
                .isFeatured(course.getIsFeatured())
                .metaTitle(course.getMetaTitle())
                .metaDescription(course.getMetaDescription())
                .metaKeywords(course.getMetaKeywords())
                .enrollmentCount(course.getEnrollmentCount())
                .isEnrollmentOpen(course.isEnrollmentOpen())
                .instructorIds(course.getInstructors().stream()
                        .map(com.example.cms.users.User::getId).toList())
                .instructorNames(course.getInstructors().stream()
                        .map(com.example.cms.users.User::getFullName).toList())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .publishedAt(course.getPublishedAt())
                .archivedAt(course.getArchivedAt())
                .build();
    }

    private EnrollmentDto toEnrollmentDto(com.example.cms.courses.Enrollment enrollment) {
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getFullName())
                .studentEmail(enrollment.getStudent().getEmail())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseCode(enrollment.getCourse().getCourseCode())
                .courseThumbnailUrl(enrollment.getCourse().getThumbnailUrl())
                .status(enrollment.getStatus())
                .enrolledAt(enrollment.getEnrolledAt())
                .confirmedAt(enrollment.getConfirmedAt())
                .startedAt(enrollment.getStartedAt())
                .completedAt(enrollment.getCompletedAt())
                .cancelledAt(enrollment.getCancelledAt())
                .cancellationReason(enrollment.getCancellationReason())
                .progressPercentage(enrollment.getProgressPercentage())
                .finalGrade(enrollment.getFinalGrade())
                .certificateIssued(enrollment.getCertificateIssued())
                .certificateIssuedAt(enrollment.getCertificateIssuedAt())
                .certificateUrl(enrollment.getCertificateUrl())
                .paymentStatus(enrollment.getPaymentStatus())
                .paymentAmount(enrollment.getPaymentAmount())
                .paymentCurrency(enrollment.getPaymentCurrency())
                .paymentReference(enrollment.getPaymentReference())
                .notes(enrollment.getNotes())
                .createdAt(enrollment.getCreatedAt())
                .updatedAt(enrollment.getUpdatedAt())
                .build();
    }
}
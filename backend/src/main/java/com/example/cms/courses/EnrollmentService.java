package com.example.cms.courses;

import com.example.cms.common.ApiResponse;
import com.example.cms.common.BusinessException;
import com.example.cms.common.PageResponse;
import com.example.cms.notifications.Notification;
import com.example.cms.notifications.NotificationRepository;
import com.example.cms.notifications.NotificationService;
import com.example.cms.users.User;
import com.example.cms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<EnrollmentDto> getEnrollments(UUID studentId, UUID courseId, List<String> statuses,
                                                      int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));

        Page<Enrollment> enrollmentPage;
        if (studentId != null && courseId != null) {
            List<Enrollment> matchingEnrollments = enrollmentRepository
                    .findByStudentIdAndCourseId(studentId, courseId)
                    .map(List::of)
                    .orElseGet(List::of);
            enrollmentPage = new PageImpl<>(matchingEnrollments, pageable, matchingEnrollments.size());
        } else if (studentId != null) {
            enrollmentPage = enrollmentRepository.findByStudentId(studentId, pageable);
        } else if (courseId != null) {
            enrollmentPage = enrollmentRepository.findByCourseId(courseId, pageable);
        } else {
            enrollmentPage = enrollmentRepository.findAll(pageable);
        }

        return PageResponse.from(enrollmentPage.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public EnrollmentDto getEnrollmentById(UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Enrollment not found"));
        return toDto(enrollment);
    }

    @Transactional(readOnly = true)
    public PageResponse<EnrollmentDto> getMyEnrollments(UUID studentId, List<String> statuses,
                                                        int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<Enrollment> enrollmentPage = enrollmentRepository.findByStudentId(studentId, pageable);
        return PageResponse.from(enrollmentPage.map(this::toDto));
    }

    @Transactional
    public EnrollmentDto enrollStudent(UUID studentId, UUID courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> BusinessException.notFound("Student not found"));

        if (!student.isStudent()) {
            throw BusinessException.forbidden("Only students can enroll in courses");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));

        // Validate course is published
        if (!course.isPublished()) {
            throw BusinessException.badRequest("Course is not published");
        }

        // Validate enrollment window
        Instant now = Instant.now();
        if (course.getEnrollmentStartDate() != null && now.isBefore(course.getEnrollmentStartDate())) {
            throw BusinessException.badRequest("Enrollment has not started yet");
        }
        if (course.getEnrollmentEndDate() != null && now.isAfter(course.getEnrollmentEndDate())) {
            throw BusinessException.badRequest("Enrollment has ended");
        }

        // Check for existing enrollment
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (existingEnrollment.isPresent()) {
            Enrollment existing = existingEnrollment.get();
            if (List.of("ENROLLED", "IN_PROGRESS", "PENDING").contains(existing.getStatus())) {
                throw BusinessException.conflict("Already enrolled in this course");
            }
            // If cancelled or completed, allow re-enrollment
        }

        // Check capacity
        if (course.getEnrollmentCapacity() != null) {
            long activeCount = enrollmentRepository.countActiveEnrollmentsByCourseId(courseId);
            if (activeCount >= course.getEnrollmentCapacity()) {
                throw BusinessException.conflict("Course has reached maximum capacity");
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .status("ENROLLED")
                .enrolledAt(now)
                .confirmedAt(now)
                .paymentStatus(course.getFee().compareTo(java.math.BigDecimal.ZERO) > 0 ? "PENDING" : "NOT_REQUIRED")
                .paymentAmount(course.getFee())
                .paymentCurrency(course.getCurrency())
                .build();

        enrollment = enrollmentRepository.save(enrollment);

        // Send notification
        notificationService.createNotification(
                studentId,
                "ENROLLMENT_CREATED",
                "Enrollment Confirmed",
                "You have been successfully enrolled in " + course.getTitle(),
                "COURSE",
                courseId,
                "/student/courses/" + courseId,
                "View Course"
        );

        log.info("Student {} enrolled in course {}", student.getEmail(), course.getTitle());
        return toDto(enrollment);
    }

    @Transactional
    public EnrollmentDto updateEnrollmentStatus(UUID enrollmentId, String status, UUID updatedById) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> BusinessException.notFound("Enrollment not found"));

        String oldStatus = enrollment.getStatus();
        enrollment.setStatus(status);

        Instant now = Instant.now();
        switch (status) {
            case "ENROLLED" -> enrollment.setConfirmedAt(now);
            case "IN_PROGRESS" -> enrollment.setStartedAt(now);
            case "COMPLETED" -> {
                enrollment.setCompletedAt(now);
                enrollment.setProgressPercentage(java.math.BigDecimal.valueOf(100));
            }
            case "CANCELLED" -> enrollment.setCancelledAt(now);
        }

        enrollment.setUpdatedBy(updatedById);
        enrollment = enrollmentRepository.save(enrollment);

        // Send notification
        notificationService.createNotification(
                enrollment.getStudent().getId(),
                "ENROLLMENT_STATUS_CHANGED",
                "Enrollment Status Updated",
                "Your enrollment in " + enrollment.getCourse().getTitle() + " has been updated to " + status,
                "ENROLLMENT",
                enrollmentId,
                "/student/courses/" + enrollment.getCourse().getId(),
                "View Course"
        );

        log.info("Enrollment {} status changed from {} to {} by {}", enrollmentId, oldStatus, status, updatedById);
        return toDto(enrollment);
    }

    @Transactional
    public EnrollmentDto cancelEnrollment(UUID enrollmentId, UUID studentId, String reason) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> BusinessException.notFound("Enrollment not found"));

        if (!enrollment.getStudent().getId().equals(studentId)) {
            throw BusinessException.forbidden("You can only cancel your own enrollments");
        }

        if (List.of("COMPLETED", "CANCELLED").contains(enrollment.getStatus())) {
            throw BusinessException.badRequest("Cannot cancel enrollment with status: " + enrollment.getStatus());
        }

        enrollment.setStatus("CANCELLED");
        enrollment.setCancelledAt(Instant.now());
        enrollment.setCancellationReason(reason);
        enrollment.setUpdatedBy(studentId);
        enrollment = enrollmentRepository.save(enrollment);

        // Send notification
        notificationService.createNotification(
                studentId,
                "ENROLLMENT_STATUS_CHANGED",
                "Enrollment Cancelled",
                "Your enrollment in " + enrollment.getCourse().getTitle() + " has been cancelled",
                "ENROLLMENT",
                enrollmentId,
                "/student/courses/" + enrollment.getCourse().getId(),
                "View Course"
        );

        log.info("Enrollment {} cancelled by student {}", enrollmentId, studentId);
        return toDto(enrollment);
    }

    private EnrollmentDto toDto(Enrollment enrollment) {
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
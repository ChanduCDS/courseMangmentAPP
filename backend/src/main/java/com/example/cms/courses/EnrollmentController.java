package com.example.cms.courses;

import com.example.cms.common.ApiResponse;
import com.example.cms.common.PageResponse;
import com.example.cms.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<PageResponse<EnrollmentDto>>> getEnrollments(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "enrolledAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        PageResponse<EnrollmentDto> response = enrollmentService.getEnrollments(studentId, courseId, statuses, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> getEnrollmentById(@PathVariable UUID id) {
        EnrollmentDto enrollment = enrollmentService.getEnrollmentById(id);
        return ResponseEntity.ok(ApiResponse.success(enrollment));
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<EnrollmentDto>>> getMyEnrollments(
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "enrolledAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        PageResponse<EnrollmentDto> response = enrollmentService.getMyEnrollments(userPrincipal.getId(), statuses, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> enroll(
            @RequestParam UUID courseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EnrollmentDto enrollment = enrollmentService.enrollStudent(userPrincipal.getId(), courseId);
        return ResponseEntity.ok(ApiResponse.success(enrollment, "Successfully enrolled in course"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EnrollmentDto enrollment = enrollmentService.updateEnrollmentStatus(id, status, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(enrollment, "Enrollment status updated successfully"));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> cancelEnrollment(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EnrollmentDto enrollment = enrollmentService.cancelEnrollment(id, userPrincipal.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success(enrollment, "Enrollment cancelled successfully"));
    }
}
package com.example.cms.dashboard;

import com.example.cms.common.ApiResponse;
import com.example.cms.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getAdminDashboard() {
        AdminDashboardDto dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/instructor/dashboard")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<InstructorDashboardDto>> getInstructorDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InstructorDashboardDto dashboard = dashboardService.getInstructorDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/student/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getStudentDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentDashboardDto dashboard = dashboardService.getStudentDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
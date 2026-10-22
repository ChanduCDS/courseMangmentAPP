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
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CourseDto>>> getCourses(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID instructorId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        PageResponse<CourseDto> response = courseService.getCourses(status, categoryId, instructorId,
                difficulty, search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getFeaturedCourses() {
        List<CourseDto> courses = courseService.getFeaturedCourses();
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseById(@PathVariable UUID id) {
        CourseDto course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @GetMapping("/code/{courseCode}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseByCode(@PathVariable String courseCode) {
        CourseDto course = courseService.getCourseByCode(courseCode);
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CourseDto course = courseService.createCourse(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(course, "Course created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(
            @PathVariable UUID id,
            @Valid @RequestBody CourseUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CourseDto course = courseService.updateCourse(id, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(course, "Course updated successfully"));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> publishCourse(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CourseDto course = courseService.publishCourse(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(course, "Course published successfully"));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> archiveCourse(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CourseDto course = courseService.archiveCourse(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(course, "Course archived successfully"));
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> restoreCourse(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CourseDto course = courseService.restoreCourse(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(course, "Course restored successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Course deleted successfully"));
    }
}
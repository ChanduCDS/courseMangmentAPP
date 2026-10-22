package com.example.cms.courses;

import com.example.cms.common.ApiResponse;
import com.example.cms.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/public/courses")
@RequiredArgsConstructor
public class PublicCourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CourseDto>>> getPublishedCourses(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        PageResponse<CourseDto> response = courseService.getCourses("PUBLISHED", categoryId, null,
                difficulty, search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getFeaturedCourses() {
        List<CourseDto> courses = courseService.getFeaturedCourses();
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> getPublishedCourseById(@PathVariable UUID id) {
        CourseDto course = courseService.getCourseById(id);
        if (!"PUBLISHED".equals(course.getStatus())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @GetMapping("/code/{courseCode}")
    public ResponseEntity<ApiResponse<CourseDto>> getPublishedCourseByCode(@PathVariable String courseCode) {
        CourseDto course = courseService.getCourseByCode(courseCode);
        if (!"PUBLISHED".equals(course.getStatus())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CourseStatsDto>> getCourseStats() {
        long totalCourses = courseRepository.countByStatus("PUBLISHED");
        long draftCourses = courseRepository.countByStatus("DRAFT");
        long inactiveCourses = courseRepository.countByStatus("INACTIVE");
        long archivedCourses = courseRepository.countByStatus("ARCHIVED");

        CourseStatsDto stats = CourseStatsDto.builder()
                .totalCourses(totalCourses)
                .publishedCourses(totalCourses)
                .draftCourses(draftCourses)
                .inactiveCourses(inactiveCourses)
                .archivedCourses(archivedCourses)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseStatsDto {
        private long totalCourses;
        private long publishedCourses;
        private long draftCourses;
        private long inactiveCourses;
        private long archivedCourses;
    }
}
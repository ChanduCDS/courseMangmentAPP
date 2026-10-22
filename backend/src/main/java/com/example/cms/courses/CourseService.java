package com.example.cms.courses;

import com.example.cms.categories.Category;
import com.example.cms.categories.CategoryRepository;
import com.example.cms.common.ApiResponse;
import com.example.cms.common.BusinessException;
import com.example.cms.common.PageResponse;
import com.example.cms.users.User;
import com.example.cms.users.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Validated
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public PageResponse<CourseDto> getCourses(String status, UUID categoryId, UUID instructorId,
                                              String difficulty, String search, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));

        Page<Course> coursePage;
        if (search != null && !search.isBlank()) {
            coursePage = courseRepository.searchByStatus(status != null ? status : "PUBLISHED", search, pageable);
        } else if (categoryId != null && instructorId != null) {
            coursePage = courseRepository.findByStatusAndCategoryId(status != null ? status : "PUBLISHED", categoryId, pageable);
        } else if (categoryId != null) {
            coursePage = courseRepository.findByStatusAndCategoryId(status != null ? status : "PUBLISHED", categoryId, pageable);
        } else if (instructorId != null) {
            coursePage = courseRepository.findByStatusAndInstructorId(status != null ? status : "PUBLISHED", instructorId, pageable);
        } else {
            coursePage = courseRepository.findByStatus(status != null ? status : "PUBLISHED", pageable);
        }

        return PageResponse.from(coursePage.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));
        return toDto(course);
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseByCode(String courseCode) {
        Course course = courseRepository.findByCourseCode(courseCode)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));
        return toDto(course);
    }

    @Transactional
    public CourseDto createCourse(CourseCreateRequest request, UUID createdById) {
        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> BusinessException.notFound("Category not found"));

        // Validate unique course code
        if (courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw BusinessException.conflict("Course code already exists");
        }

        // Validate instructors
        List<User> instructors = List.of();
        if (request.getInstructorIds() != null && !request.getInstructorIds().isEmpty()) {
            instructors = userRepository.findAllById(request.getInstructorIds());
            if (instructors.size() != request.getInstructorIds().size()) {
                throw BusinessException.badRequest("One or more instructors not found");
            }
            // Verify all are instructors
            for (User instructor : instructors) {
                if (!instructor.isInstructor()) {
                    throw BusinessException.badRequest("User " + instructor.getEmail() + " is not an instructor");
                }
            }
        }

        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> BusinessException.notFound("User not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .courseCode(request.getCourseCode())
                .shortDescription(request.getShortDescription())
                .fullDescription(request.getFullDescription())
                .category(category)
                .thumbnailUrl(request.getThumbnailUrl())
                .duration(request.getDuration())
                .durationUnit(request.getDurationUnit())
                .fee(request.getFee())
                .currency(request.getCurrency())
                .difficultyLevel(request.getDifficultyLevel())
                .status("DRAFT")
                .enrollmentCapacity(request.getEnrollmentCapacity())
                .enrollmentStartDate(request.getEnrollmentStartDate())
                .enrollmentEndDate(request.getEnrollmentEndDate())
                .courseStartDate(request.getCourseStartDate())
                .courseEndDate(request.getCourseEndDate())
                .isFeatured(request.getIsFeatured())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .metaKeywords(request.getMetaKeywords())
                .build();
        course.setCreatedBy(createdById);

        course.getInstructors().addAll(instructors);

        course = courseRepository.save(course);
        log.info("Course created: {} by {}", course.getTitle(), createdBy.getEmail());

        return toDto(course);
    }

    @Transactional
    public CourseDto updateCourse(UUID id, CourseUpdateRequest request, UUID updatedById) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));

        // Validate category if changed
        if (request.getCategoryId() != null && !request.getCategoryId().equals(course.getCategory().getId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> BusinessException.notFound("Category not found"));
            course.setCategory(category);
        }

        // Validate unique course code if changed
        if (request.getCourseCode() != null && !request.getCourseCode().equals(course.getCourseCode())) {
            if (courseRepository.existsByCourseCode(request.getCourseCode())) {
                throw BusinessException.conflict("Course code already exists");
            }
            course.setCourseCode(request.getCourseCode());
        }

        // Update fields
        Optional.ofNullable(request.getTitle()).ifPresent(course::setTitle);
        Optional.ofNullable(request.getShortDescription()).ifPresent(course::setShortDescription);
        Optional.ofNullable(request.getFullDescription()).ifPresent(course::setFullDescription);
        Optional.ofNullable(request.getThumbnailUrl()).ifPresent(course::setThumbnailUrl);
        Optional.ofNullable(request.getDuration()).ifPresent(course::setDuration);
        Optional.ofNullable(request.getDurationUnit()).ifPresent(course::setDurationUnit);
        Optional.ofNullable(request.getFee()).ifPresent(course::setFee);
        Optional.ofNullable(request.getCurrency()).ifPresent(course::setCurrency);
        Optional.ofNullable(request.getDifficultyLevel()).ifPresent(course::setDifficultyLevel);
        Optional.ofNullable(request.getEnrollmentCapacity()).ifPresent(course::setEnrollmentCapacity);
        Optional.ofNullable(request.getEnrollmentStartDate()).ifPresent(course::setEnrollmentStartDate);
        Optional.ofNullable(request.getEnrollmentEndDate()).ifPresent(course::setEnrollmentEndDate);
        Optional.ofNullable(request.getCourseStartDate()).ifPresent(course::setCourseStartDate);
        Optional.ofNullable(request.getCourseEndDate()).ifPresent(course::setCourseEndDate);
        Optional.ofNullable(request.getIsFeatured()).ifPresent(course::setIsFeatured);
        Optional.ofNullable(request.getMetaTitle()).ifPresent(course::setMetaTitle);
        Optional.ofNullable(request.getMetaDescription()).ifPresent(course::setMetaDescription);
        Optional.ofNullable(request.getMetaKeywords()).ifPresent(course::setMetaKeywords);

        // Update instructors if provided
        if (request.getInstructorIds() != null) {
            List<User> instructors = userRepository.findAllById(request.getInstructorIds());
            if (instructors.size() != request.getInstructorIds().size()) {
                throw BusinessException.badRequest("One or more instructors not found");
            }
            for (User instructor : instructors) {
                if (!instructor.isInstructor()) {
                    throw BusinessException.badRequest("User " + instructor.getEmail() + " is not an instructor");
                }
            }
            course.getInstructors().clear();
            course.getInstructors().addAll(instructors);
        }

        course.setUpdatedBy(updatedById);
        course = courseRepository.save(course);
        log.info("Course updated: {} by {}", course.getTitle(), updatedById);

        return toDto(course);
    }

    @Transactional
    public CourseDto publishCourse(UUID id, UUID updatedById) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));

        validateCourseForPublishing(course);

        course.setStatus("PUBLISHED");
        course.setPublishedAt(Instant.now());
        course.setUpdatedBy(updatedById);
        course = courseRepository.save(course);

        log.info("Course published: {} by {}", course.getTitle(), updatedById);
        return toDto(course);
    }

    @Transactional
    public CourseDto archiveCourse(UUID id, UUID updatedById) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));

        if ("ARCHIVED".equals(course.getStatus())) {
            throw BusinessException.badRequest("Course is already archived");
        }

        course.setStatus("ARCHIVED");
        course.setArchivedAt(Instant.now());
        course.setUpdatedBy(updatedById);
        course = courseRepository.save(course);

        log.info("Course archived: {} by {}", course.getTitle(), updatedById);
        return toDto(course);
    }

    @Transactional
    public CourseDto restoreCourse(UUID id, UUID updatedById) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));

        if (!"ARCHIVED".equals(course.getStatus())) {
            throw BusinessException.badRequest("Only archived courses can be restored");
        }

        course.setStatus("DRAFT");
        course.setArchivedAt(null);
        course.setUpdatedBy(updatedById);
        course = courseRepository.save(course);

        log.info("Course restored: {} by {}", course.getTitle(), updatedById);
        return toDto(course);
    }

    @Transactional
    public void deleteCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Course not found"));

        // Check if course has active enrollments
        long activeEnrollments = enrollmentRepository.countActiveEnrollmentsByCourseId(id);
        if (activeEnrollments > 0) {
            throw BusinessException.conflict("Cannot delete course with active enrollments. Archive it instead.");
        }

        courseRepository.delete(course);
        log.info("Course deleted: {}", course.getTitle());
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getFeaturedCourses() {
        return courseRepository.findFeaturedPublishedCourses().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return courseRepository.countByStatus(status);
    }

    @Transactional(readOnly = true)
    public long countByCategoryAndStatus(UUID categoryId, String status) {
        return courseRepository.countByCategoryIdAndStatus(categoryId, status);
    }

    private void validateCourseForPublishing(Course course) {
        if (course.getTitle() == null || course.getTitle().isBlank()) {
            throw BusinessException.badRequest("Course title is required");
        }
        if (course.getCourseCode() == null || course.getCourseCode().isBlank()) {
            throw BusinessException.badRequest("Course code is required");
        }
        if (course.getCategory() == null) {
            throw BusinessException.badRequest("Category is required");
        }
        if (course.getFee() == null || course.getFee().compareTo(BigDecimal.ZERO) < 0) {
            throw BusinessException.badRequest("Fee must be non-negative");
        }
        if (course.getDuration() == null || course.getDuration() < 0) {
            throw BusinessException.badRequest("Duration must be non-negative");
        }
        if (course.getEnrollmentCapacity() != null && course.getEnrollmentCapacity() < 1) {
            throw BusinessException.badRequest("Enrollment capacity must be at least 1");
        }
        if (course.getEnrollmentStartDate() != null && course.getEnrollmentEndDate() != null
                && course.getEnrollmentStartDate().isAfter(course.getEnrollmentEndDate())) {
            throw BusinessException.badRequest("Enrollment start date must be before end date");
        }
    }

    private CourseDto toDto(Course course) {
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
                .instructorIds(course.getInstructors().stream().map(User::getId).toList())
                .instructorNames(course.getInstructors().stream().map(User::getFullName).toList())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .publishedAt(course.getPublishedAt())
                .archivedAt(course.getArchivedAt())
                .build();
    }
}
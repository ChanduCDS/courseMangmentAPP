package com.example.cms.categories;

import com.example.cms.courses.CourseRepository;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Validated
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<CategoryDto> getCategories(String search, Boolean isActive, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));

        Page<Category> categoryPage;
        if (search != null && !search.isBlank()) {
            categoryPage = categoryRepository.searchActiveCategories(search, pageable);
        } else if (isActive != null) {
            categoryPage = categoryRepository.findByIsActive(isActive, pageable);
        } else {
            categoryPage = categoryRepository.findByIsActiveTrueOrderBySortOrderAsc(pageable);
        }

        return PageResponse.from(categoryPage.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Category not found"));
        return toDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryCreateRequest request, UUID createdById) {
        if (categoryRepository.existsByName(request.getName())) {
            throw BusinessException.conflict("Category name already exists");
        }

        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> BusinessException.notFound("User not found"));

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .color(request.getColor())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        category.setCreatedBy(createdById);

        category = categoryRepository.save(category);
        log.info("Category created: {} by {}", category.getName(), createdBy.getEmail());

        return toDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, CategoryUpdateRequest request, UUID updatedById) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Category not found"));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw BusinessException.conflict("Category name already exists");
            }
            category.setName(request.getName());
        }

        Optional.ofNullable(request.getDescription()).ifPresent(category::setDescription);
        Optional.ofNullable(request.getIcon()).ifPresent(category::setIcon);
        Optional.ofNullable(request.getColor()).ifPresent(category::setColor);
        Optional.ofNullable(request.getIsActive()).ifPresent(category::setIsActive);
        Optional.ofNullable(request.getSortOrder()).ifPresent(category::setSortOrder);

        category.setUpdatedBy(updatedById);
        category = categoryRepository.save(category);

        log.info("Category updated: {} by {}", category.getName(), updatedById);
        return toDto(category);
    }

    @Transactional
    public CategoryDto toggleStatus(UUID id, UUID updatedById) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Category not found"));

        category.setIsActive(!category.getIsActive());
        category.setUpdatedBy(updatedById);
        category = categoryRepository.save(category);

        log.info("Category status toggled: {} to {} by {}", category.getName(), category.getIsActive(), updatedById);
        return toDto(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Category not found"));

        // Check if category has courses
        long courseCount = courseRepository.countByCategoryIdAndStatus(category.getId(), "PUBLISHED");
        courseCount += courseRepository.countByCategoryIdAndStatus(category.getId(), "DRAFT");
        courseCount += courseRepository.countByCategoryIdAndStatus(category.getId(), "INACTIVE");

        if (courseCount > 0) {
            throw BusinessException.conflict("Cannot delete category with associated courses. Deactivate it instead.");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }

    @Transactional
    public void updateCourseCounts() {
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            long count = courseRepository.countByCategoryIdAndStatus(category.getId(), "PUBLISHED");
            count += courseRepository.countByCategoryIdAndStatus(category.getId(), "DRAFT");
            count += courseRepository.countByCategoryIdAndStatus(category.getId(), "INACTIVE");
            category.setCourseCount((int) count);
        }
        categoryRepository.saveAll(categories);
    }

    private CategoryDto toDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .color(category.getColor())
                .isActive(category.getIsActive())
                .sortOrder(category.getSortOrder())
                .courseCount(category.getCourseCount())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
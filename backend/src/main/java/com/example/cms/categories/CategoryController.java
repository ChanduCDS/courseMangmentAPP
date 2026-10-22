package com.example.cms.categories;

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
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<CategoryDto>>> getCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "sortOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        PageResponse<CategoryDto> response = categoryService.getCategories(search, isActive, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getActiveCategories() {
        List<CategoryDto> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable UUID id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CategoryDto category = categoryService.createCategory(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(category, "Category created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CategoryDto category = categoryService.updateCategory(id, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> toggleStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CategoryDto category = categoryService.toggleStatus(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(category, "Category status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
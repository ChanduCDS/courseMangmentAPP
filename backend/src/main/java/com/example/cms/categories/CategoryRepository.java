package com.example.cms.categories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    List<Category> findByIsActiveTrueOrderBySortOrderAsc();

    Page<Category> findByIsActiveTrueOrderBySortOrderAsc(Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.isActive = true AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY c.sortOrder ASC")
    Page<Category> searchActiveCategories(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.isActive = :active ORDER BY c.sortOrder ASC")
    List<Category> findByIsActive(@Param("active") Boolean active);

    @Query("SELECT c FROM Category c WHERE c.isActive = :active ORDER BY c.sortOrder ASC")
    Page<Category> findByIsActive(@Param("active") Boolean active, Pageable pageable);
}
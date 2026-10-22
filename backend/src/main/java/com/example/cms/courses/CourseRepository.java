package com.example.cms.courses;

import com.example.cms.categories.Category;
import com.example.cms.users.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    Optional<Course> findByCourseCode(String courseCode);

    boolean existsByCourseCode(String courseCode);

    List<Course> findByCategoryIdAndStatus(UUID categoryId, String status);

    List<Course> findByStatus(String status);

    List<Course> findByIsFeaturedTrueAndStatus(String status);

    Page<Course> findByStatus(String status, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = :status AND c.category.id = :categoryId")
    Page<Course> findByStatusAndCategoryId(@Param("status") String status, @Param("categoryId") UUID categoryId, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = :status AND :instructorId MEMBER OF c.instructors")
    Page<Course> findByStatusAndInstructorId(@Param("status") String status, @Param("instructorId") UUID instructorId, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = :status AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY c.createdAt DESC")
    Page<Course> searchByStatus(@Param("status") String status, @Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND (c.enrollmentStartDate IS NULL OR c.enrollmentStartDate <= :now) AND (c.enrollmentEndDate IS NULL OR c.enrollmentEndDate >= :now) ORDER BY c.createdAt DESC")
    Page<Course> findPublishedEnrollableCourses(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND c.isFeatured = true ORDER BY c.createdAt DESC")
    List<Course> findFeaturedPublishedCourses();

    @Query("SELECT c FROM Course c WHERE c.createdBy = :userId ORDER BY c.createdAt DESC")
    Page<Course> findByCreatedBy(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Course c WHERE c.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(c) FROM Course c WHERE c.category.id = :categoryId AND c.status = :status")
    long countByCategoryIdAndStatus(@Param("categoryId") UUID categoryId, @Param("status") String status);
}
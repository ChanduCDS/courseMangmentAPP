package com.example.cms.courses;

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
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    Optional<Enrollment> findByStudentIdAndCourseId(UUID studentId, UUID courseId);

    List<Enrollment> findByStudentId(UUID studentId);

    List<Enrollment> findByCourseId(UUID courseId);

    List<Enrollment> findByStatusIn(List<String> statuses);

    Page<Enrollment> findByStudentId(UUID studentId, Pageable pageable);

    Page<Enrollment> findByCourseId(UUID courseId, Pageable pageable);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status IN :statuses")
    List<Enrollment> findByStudentIdAndStatusIn(@Param("studentId") UUID studentId, @Param("statuses") List<String> statuses);

    @Query("SELECT e FROM Enrollment e WHERE e.course.id = :courseId AND e.status IN :statuses")
    List<Enrollment> findByCourseIdAndStatusIn(@Param("courseId") UUID courseId, @Param("statuses") List<String> statuses);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.status IN ('ENROLLED', 'IN_PROGRESS', 'COMPLETED')")
    long countActiveEnrollmentsByCourseId(@Param("courseId") UUID courseId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.student.id = :studentId AND e.status IN ('ENROLLED', 'IN_PROGRESS', 'COMPLETED')")
    long countActiveEnrollmentsByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT e FROM Enrollment e WHERE e.status = 'PENDING' ORDER BY e.enrolledAt ASC")
    List<Enrollment> findPendingEnrollments();

    @Query("SELECT e FROM Enrollment e WHERE e.status = 'ENROLLED' AND e.course.enrollmentEndDate IS NOT NULL AND e.course.enrollmentEndDate < :now")
    List<Enrollment> findEnrollmentsPastEnrollmentEndDate(@Param("now") Instant now);
}
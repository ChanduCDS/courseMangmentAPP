package com.example.cms.dashboard;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDashboardDto {

    private long totalAssignedCourses;
    private long totalEnrolledStudents;
    private List<CourseEnrollmentStatDto> courseStats;
    private List<RecentEnrollmentDto> recentEnrollments;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CourseEnrollmentStatDto {
    private UUID courseId;
    private String courseTitle;
    private String courseCode;
    private long enrolledStudents;
    private Integer capacity;
}
package com.example.cms.dashboard;

import com.example.cms.courses.CourseDto;
import com.example.cms.courses.EnrollmentDto;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDto {

    private long enrolledCourses;
    private long inProgressCourses;
    private long completedCourses;
    private List<EnrollmentDto> enrollments;
    private List<CourseDto> recommendedCourses;
}
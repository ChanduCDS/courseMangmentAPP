package com.example.cms.seed;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Seeds demo data on startup (after Flyway has created the schema).
 *
 * Every row is inserted ONLY if it does not already exist (checked by its natural key:
 * email, course_code, name, unique pair...). Existing rows are never updated or duplicated,
 * so restarting the backend is safe.
 *
 * Disable with:  app.seed.enabled=false   (or env SEED_ENABLED=false)
 */
@Component
@Order(1)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:${SEED_ENABLED:true}}")
    private boolean enabled;

    @Value("${app.seed.admin-email:${SEED_ADMIN_EMAIL:admin@cms.com}}")
    private String adminEmail;

    @Value("${app.seed.admin-password:${SEED_ADMIN_PASSWORD:Admin@12345}}")
    private String adminPassword;

    @Value("${app.seed.demo-password:${SEED_DEMO_PASSWORD:Demo@12345}}")
    private String demoPassword;

    public DataSeeder(JdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Data seeding disabled (app.seed.enabled=false)");
            return;
        }
        log.info("Seeding demo data (only missing rows are inserted)...");
        try {
            int n = 0;
            n += seedRolesAndCategories();
            n += seedUsers();
            n += seedCourses();
            n += seedEnrollments();
            n += seedNotifications();
            n += seedAuditLogs();
            log.info("Seeding finished: {} new row(s) inserted.", n);
            if (n > 0) {
                log.info("Demo admin login -> {} / {}", adminEmail, adminPassword);
            }
        } catch (Exception e) {
            // never stop the application from starting because of demo data
            log.error("Data seeding failed, continuing without demo data", e);
        }
    }

    // ---------------------------------------------------------------- roles + categories

    private int seedRolesAndCategories() {
        int n = 0;
        String[][] roles = {
                {"ADMIN", "System administrator with full access"},
                {"INSTRUCTOR", "Course instructor with course management permissions"},
                {"STUDENT", "Student with enrollment and learning permissions"}
        };
        for (String[] r : roles) {
            n += jdbc.update("INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, true) "
                    + "ON CONFLICT (name) DO NOTHING", r[0], r[1]);
        }
        Object[][] cats = {
                {"Programming", "Software development and programming courses", "code", "#007BA7", 1},
                {"Data Science", "Data analysis, machine learning, and AI courses", "database", "#10B981", 2},
                {"Design", "UI/UX, graphic design, and creative courses", "palette", "#F59E0B", 3},
                {"Business", "Business, marketing, and entrepreneurship courses", "briefcase", "#8B5CF6", 4},
                {"Marketing", "Digital marketing, SEO, and social media courses", "megaphone", "#EC4899", 5},
                {"Cloud Computing", "Cloud platforms, DevOps, and infrastructure courses", "cloud", "#06B6D4", 6}
        };
        for (Object[] c : cats) {
            n += jdbc.update("INSERT INTO categories (name, description, icon, color, sort_order, is_active) "
                    + "VALUES (?, ?, ?, ?, ?, true) ON CONFLICT (name) DO NOTHING", c);
        }
        return n;
    }

    // ---------------------------------------------------------------- users

    private int seedUsers() {
        int n = 0;
        n += insertUser(adminEmail, adminPassword, "System", "Admin", "+1-555-0100", "ADMIN");

        n += insertUser("john.instructor@cms.com", demoPassword, "John", "Carter", "+1-555-0101", "INSTRUCTOR");
        n += insertUser("sara.instructor@cms.com", demoPassword, "Sara", "Mitchell", "+1-555-0102", "INSTRUCTOR");

        n += insertUser("alice.student@cms.com", demoPassword, "Alice", "Johnson", "+1-555-0201", "STUDENT");
        n += insertUser("bob.student@cms.com", demoPassword, "Bob", "Smith", "+1-555-0202", "STUDENT");
        n += insertUser("carol.student@cms.com", demoPassword, "Carol", "Davis", "+1-555-0203", "STUDENT");
        n += insertUser("david.student@cms.com", demoPassword, "David", "Lee", "+1-555-0204", "STUDENT");
        n += insertUser("emma.student@cms.com", demoPassword, "Emma", "Brown", "+1-555-0205", "STUDENT");
        return n;
    }

    /** Inserts the user + role only when the e-mail does not exist yet. */
    private int insertUser(String email, String rawPassword, String first, String last, String phone, String role) {
        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE lower(email) = lower(?)",
                Integer.class, email);
        if (exists != null && exists > 0) {
            return 0;
        }
        int inserted = jdbc.update(
                "INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, is_email_verified) "
                        + "VALUES (?, ?, ?, ?, ?, true, true)",
                email, passwordEncoder.encode(rawPassword), first, last, phone);
        jdbc.update("INSERT INTO user_roles (user_id, role_id) "
                        + "SELECT u.id, r.id FROM users u, roles r WHERE u.email = ? AND r.name = ? "
                        + "ON CONFLICT DO NOTHING",
                email, role);
        return inserted;
    }

    // ---------------------------------------------------------------- courses

    private int seedCourses() {
        int n = 0;
        // code, title, short desc, category, hours, fee, level, status, capacity, featured, instructor email
        Object[][] courses = {
                {"JAVA101", "Java Programming Fundamentals", "Learn Java from scratch.",
                        "Programming", 40, "49.99", "BEGINNER", "PUBLISHED", 100, true, "john.instructor@cms.com"},
                {"SPRING201", "Spring Boot REST APIs", "Build production-ready REST APIs with Spring Boot.",
                        "Programming", 30, "79.99", "INTERMEDIATE", "PUBLISHED", 60, true, "john.instructor@cms.com"},
                {"DS101", "Data Science with Python", "Data analysis, pandas and machine learning basics.",
                        "Data Science", 50, "99.00", "BEGINNER", "PUBLISHED", 80, true, "sara.instructor@cms.com"},
                {"UX101", "UI/UX Design Essentials", "Design thinking, wireframes and prototyping.",
                        "Design", 25, "59.00", "BEGINNER", "PUBLISHED", 40, false, "sara.instructor@cms.com"},
                {"AWS301", "AWS Cloud Practitioner", "Core AWS services and cloud concepts.",
                        "Cloud Computing", 35, "89.00", "ADVANCED", "DRAFT", 50, false, "john.instructor@cms.com"},
                {"MKT101", "Digital Marketing Basics", "SEO, social media and content marketing.",
                        "Marketing", 20, "0.00", "BEGINNER", "PUBLISHED", null, false, "sara.instructor@cms.com"}
        };
        for (Object[] c : courses) {
            String code = (String) c[0];
            String status = (String) c[7];
            int inserted = jdbc.update(
                    "INSERT INTO courses (title, course_code, short_description, full_description, category_id, "
                            + "duration, duration_unit, fee, currency, difficulty_level, status, enrollment_capacity, "
                            + "is_featured, published_at) "
                            + "SELECT ?, ?, ?, ?, cat.id, ?, 'HOURS', ?, 'USD', ?, ?, CAST(? AS INTEGER), ?, "
                            + "CASE WHEN ? = 'PUBLISHED' THEN CURRENT_TIMESTAMP ELSE NULL END "
                            + "FROM categories cat WHERE cat.name = ? "
                            + "AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = ?)",
                    c[1], code, c[2], c[2] + " (demo course)", c[4], new BigDecimal((String) c[5]), c[6], status,
                    c[8], c[9], status, c[3], code);
            n += inserted;
            // instructor assignment, only when the course was just created
            if (inserted > 0) {
                jdbc.update("INSERT INTO course_instructors (course_id, instructor_id, is_primary) "
                                + "SELECT c.id, u.id, true FROM courses c, users u "
                                + "WHERE c.course_code = ? AND u.email = ? ON CONFLICT DO NOTHING",
                        code, c[10]);
            }
        }
        return n;
    }

    // ---------------------------------------------------------------- enrollments

    private int seedEnrollments() {
        int n = 0;
        // student email, course code, status, progress, days ago
        Object[][] rows = {
                {"alice.student@cms.com", "JAVA101", "COMPLETED", "100.00", 60},
                {"alice.student@cms.com", "SPRING201", "IN_PROGRESS", "45.50", 20},
                {"bob.student@cms.com", "JAVA101", "IN_PROGRESS", "70.00", 30},
                {"bob.student@cms.com", "DS101", "ENROLLED", "10.00", 7},
                {"carol.student@cms.com", "DS101", "IN_PROGRESS", "55.25", 25},
                {"carol.student@cms.com", "UX101", "PENDING", "0.00", 2},
                {"david.student@cms.com", "MKT101", "COMPLETED", "100.00", 45},
                {"david.student@cms.com", "JAVA101", "CANCELLED", "5.00", 15},
                {"emma.student@cms.com", "SPRING201", "ENROLLED", "15.00", 5},
                {"emma.student@cms.com", "UX101", "ENROLLED", "30.00", 10}
        };
        for (Object[] r : rows) {
            String status = (String) r[2];
            n += jdbc.update(
                    "INSERT INTO enrollments (student_id, course_id, status, enrolled_at, progress_percentage, "
                            + "completed_at, final_grade, certificate_issued, cancelled_at, cancellation_reason, "
                            + "payment_status, payment_amount, payment_currency) "
                            + "SELECT u.id, c.id, ?, now() - make_interval(days => ?), ?, "
                            + "CASE WHEN ? = 'COMPLETED' THEN now() - make_interval(days => 1) END, "
                            + "CASE WHEN ? = 'COMPLETED' THEN 'A' END, "
                            + "(? = 'COMPLETED'), "
                            + "CASE WHEN ? = 'CANCELLED' THEN now() - make_interval(days => 1) END, "
                            + "CASE WHEN ? = 'CANCELLED' THEN 'Schedule conflict' END, "
                            + "CASE WHEN c.fee > 0 THEN 'PAID' ELSE 'NOT_REQUIRED' END, c.fee, c.currency "
                            + "FROM users u, courses c WHERE u.email = ? AND c.course_code = ? "
                            + "ON CONFLICT (student_id, course_id) DO NOTHING",
                    status, r[4], new BigDecimal((String) r[3]),
                    status, status, status, status, status,
                    r[0], r[1]);
        }
        return n;
    }

    // ---------------------------------------------------------------- notifications

    private int seedNotifications() {
        int n = 0;
        // user email, type, title, message, priority, read?
        Object[][] rows = {
                {adminEmail, "ANNOUNCEMENT", "Welcome to Course Management System",
                        "Your demo admin account is ready. Explore courses, categories and users.", "NORMAL", false},
                {adminEmail, "ENROLLMENT_CREATED", "New enrollment received",
                        "A student enrolled in Java Programming Fundamentals.", "NORMAL", false},
                {"john.instructor@cms.com", "COURSE_PUBLISHED", "Your course is live",
                        "Java Programming Fundamentals has been published.", "HIGH", true},
                {"sara.instructor@cms.com", "ENROLLMENT_CREATED", "New students joined",
                        "New students enrolled in Data Science with Python.", "NORMAL", false},
                {"alice.student@cms.com", "ENROLLMENT_STATUS_CHANGED", "Course completed",
                        "Congratulations! You completed Java Programming Fundamentals.", "HIGH", false},
                {"bob.student@cms.com", "ANNOUNCEMENT", "Welcome",
                        "Welcome to the platform. Start learning today!", "LOW", true},
                {"carol.student@cms.com", "ENROLLMENT_CREATED", "Enrollment pending",
                        "Your enrollment in UI/UX Design Essentials is pending confirmation.", "NORMAL", false}
        };
        for (Object[] r : rows) {
            n += jdbc.update(
                    "INSERT INTO notifications (user_id, type, title, message, priority, is_read, read_at) "
                            + "SELECT u.id, ?, ?, ?, ?, ?, CASE WHEN ? THEN now() END FROM users u "
                            + "WHERE u.email = ? "
                            + "AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.title = ?)",
                    r[1], r[2], r[3], r[4], r[5], r[5], r[0], r[2]);
        }
        return n;
    }

    // ---------------------------------------------------------------- audit logs

    private int seedAuditLogs() {
        int n = 0;
        // request id (marker used to avoid duplicates), action, entity type, new values json
        String[][] rows = {
                {"seed-audit-1", "CREATE", "COURSE", "{\"courseCode\":\"JAVA101\"}"},
                {"seed-audit-2", "PUBLISH", "COURSE", "{\"courseCode\":\"JAVA101\",\"status\":\"PUBLISHED\"}"},
                {"seed-audit-3", "CREATE", "COURSE", "{\"courseCode\":\"DS101\"}"},
                {"seed-audit-4", "CREATE", "CATEGORY", "{\"name\":\"Programming\"}"},
                {"seed-audit-5", "ENROLL", "ENROLLMENT", "{\"student\":\"alice.student@cms.com\"}"}
        };
        for (String[] r : rows) {
            n += jdbc.update(
                    "INSERT INTO audit_logs (user_id, action, entity_type, new_values, ip_address, request_id, status) "
                            + "SELECT u.id, ?, ?, ?::jsonb, '127.0.0.1', ?, 'SUCCESS' FROM users u "
                            + "WHERE u.email = ? "
                            + "AND NOT EXISTS (SELECT 1 FROM audit_logs a WHERE a.request_id = ?)",
                    r[1], r[2], r[3], r[0], adminEmail, r[0]);
        }
        return n;
    }
}
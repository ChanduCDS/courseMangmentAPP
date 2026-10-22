package com.example.cms.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);

    List<User> findByIsActiveTrue();

    List<User> findByRoles_Name(String roleName);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findActiveByEmail(@Param("email") String email);
}
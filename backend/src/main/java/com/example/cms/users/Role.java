package com.example.cms.users;

import com.example.cms.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @NotBlank
    @Size(max = 50)
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    @Column(name = "is_system_role", nullable = false)
    @Builder.Default
    private Boolean isSystemRole = false;
}
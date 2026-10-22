package com.example.cms.categories;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    private UUID id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private Boolean isActive;
    private Integer sortOrder;
    private Integer courseCount;
    private Instant createdAt;
    private Instant updatedAt;
}
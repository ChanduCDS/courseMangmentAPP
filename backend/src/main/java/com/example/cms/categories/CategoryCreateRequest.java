package com.example.cms.categories;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    private String description;

    @Size(max = 100)
    private String icon;

    @Size(max = 7)
    private String color;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer sortOrder = 0;
}
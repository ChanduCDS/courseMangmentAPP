package com.example.cms.categories;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateRequest {

    @Size(max = 100)
    private String name;

    private String description;

    @Size(max = 100)
    private String icon;

    @Size(max = 7)
    private String color;

    private Boolean isActive;

    private Integer sortOrder;
}
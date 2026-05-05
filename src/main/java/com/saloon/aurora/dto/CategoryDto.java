package com.saloon.aurora.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    private Integer id;

    @NotBlank(message = "Please enter Category Name")
    private String category;
}

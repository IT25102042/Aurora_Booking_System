package com.saloon.aurora.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDto {

    private Integer id;

    @NotBlank(message = "Service title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Service description is required")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be a positive value")
    private Double price;

    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    @Max(value = 480, message = "Duration cannot exceed 480 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Category is required")
    private Integer categoryId;
    
    private String categoryName;

    @NotNull(message = "Target gender is required")
    private Integer genderId;
    
    private String genderName;

    @NotNull(message = "Status is required")
    private Integer serviceStatusId;
    
    private String serviceStatusName;

    private Date createdAt;
}

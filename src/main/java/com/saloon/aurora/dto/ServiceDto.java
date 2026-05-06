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
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    private String title;

    @NotBlank(message = "Service description is required")
    @Size(min = 10, message = "Description should be at least 10 characters long")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be a positive value greater than zero")
    private Double price;

    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    @Max(value = 480, message = "Duration cannot exceed 480 minutes (8 hours)")
    private Integer durationMinutes;

    @NotNull(message = "Category is required")
    @Positive(message = "Invalid Category ID")
    private Integer categoryId;
    
    private String categoryName;

    @NotNull(message = "Target gender is required")
    @Positive(message = "Invalid Gender ID")
    private Integer genderId;
    
    private String genderName;

    @NotNull(message = "Status is required")
    @Positive(message = "Invalid Status ID")
    private Integer serviceStatusId;
    
    private String serviceStatusName;

    private Date createdAt;
}

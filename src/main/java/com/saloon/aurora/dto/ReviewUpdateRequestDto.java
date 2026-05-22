package com.saloon.aurora.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpdateRequestDto {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    @NotBlank(message = "Review text is required")
    @Size(min = 10, message = "Review must be at least 10 characters")
    @Size(max = 1000, message = "Review cannot exceed 1000 characters")
    private String reviewText;

}
package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDto {

    private Integer id;

    private String title;

    private String description;

    private Double price;

    private Integer durationMinutes;

    private Integer categoryId;
    private String categoryName;

    private Integer genderId;
    private String genderName;

    private Integer serviceStatusId;
    private String serviceStatusName;

    private Date createdAt;
}

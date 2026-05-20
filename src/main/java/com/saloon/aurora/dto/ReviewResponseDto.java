package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {

    private Integer id;
    private Integer appointmentId;
    private String reviewerName;
    private String serviceName;
    private Integer rating;
    private String reviewText;
    private Boolean hasPhoto;
    private Date createdAt;
    private Boolean isUpdated;

}
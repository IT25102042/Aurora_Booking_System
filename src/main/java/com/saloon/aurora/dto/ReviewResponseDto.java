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
    private String reviewerName;   // built from user.firstName + user.lastName in service layer
    private String serviceName;    // from appointment.service.title
    private Integer rating;
    private String reviewText;
    private Boolean hasPhoto;      // true if review_images
    private Date createdAt;

}
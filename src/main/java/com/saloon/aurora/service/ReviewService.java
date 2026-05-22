package com.saloon.aurora.service;

import com.saloon.aurora.dto.ReviewRequestDto;
import com.saloon.aurora.dto.ReviewResponseDto;
import com.saloon.aurora.dto.ReviewUpdateRequestDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ReviewService {

    // User submits a new review (with optional photo)
    void submitReview(ReviewRequestDto reviewRequestDto, MultipartFile photo, Integer userId) throws IOException;

    // User updates their own review (only once — only rating and reviewText)
    void updateReview(Integer reviewId, ReviewUpdateRequestDto reviewUpdateRequestDto, Integer userId);

    // User permanently deletes their own review
    void deleteReview(Integer reviewId, Integer userId) throws IOException;

    // Get all reviews by logged-in user (My Account - My Reviews)
    List<ReviewResponseDto> getMyReviews(Integer userId);

    // Get all reviews for a specific service (Single Service Page)
    List<ReviewResponseDto> getReviewsByService(Integer serviceId);

    // Get all reviews done by user's
    List<ReviewResponseDto> getAllReviews();
}
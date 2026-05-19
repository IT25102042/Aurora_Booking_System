package com.saloon.aurora.service;

import com.saloon.aurora.dto.ReviewRequestDto;
import com.saloon.aurora.dto.ReviewResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ReviewService {

    void submitReview(ReviewRequestDto reviewRequestDto, MultipartFile photo, Integer userId) throws IOException;

    List<ReviewResponseDto> getMyReviews(Integer userId);

    List<ReviewResponseDto> getReviewsByService(Integer serviceId);

}
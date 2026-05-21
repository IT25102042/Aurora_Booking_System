package com.saloon.aurora.controller;

import com.saloon.aurora.dto.ReviewRequestDto;
import com.saloon.aurora.dto.ReviewResponseDto;
import com.saloon.aurora.dto.ReviewUpdateRequestDto;
import com.saloon.aurora.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Submit Review

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submitReview(
            @RequestPart("review") @Valid ReviewRequestDto reviewRequestDto,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestParam Integer userId) {
        try {
            reviewService.submitReview(reviewRequestDto, photo, userId);
            return ResponseEntity.ok("Review submitted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload photo");
        }
    }

    // Update Review

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Integer reviewId,
            @RequestBody @Valid ReviewUpdateRequestDto reviewUpdateRequestDto,
            @RequestParam Integer userId) {
        try {
            reviewService.updateReview(reviewId, reviewUpdateRequestDto, userId);
            return ResponseEntity.ok("Review updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete Review

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer reviewId,
            @RequestParam Integer userId) {
        try {
            reviewService.deleteReview(reviewId, userId);
            return ResponseEntity.ok("Review deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to delete review photo");
        }
    }

    // Get My Reviews

    @GetMapping("/my")
    public ResponseEntity<?> getMyReviews(@RequestParam Integer userId) {
        try {
            List<ReviewResponseDto> reviews = reviewService.getMyReviews(userId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get Reviews By Service

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<?> getReviewsByService(@PathVariable Integer serviceId) {
        try {
            List<ReviewResponseDto> reviews = reviewService.getReviewsByService(serviceId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
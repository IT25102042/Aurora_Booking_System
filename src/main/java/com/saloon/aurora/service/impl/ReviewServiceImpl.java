package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.ReviewRequestDto;
import com.saloon.aurora.dto.ReviewResponseDto;
import com.saloon.aurora.dto.ReviewUpdateRequestDto;
import com.saloon.aurora.entity.AppointmentEntity;
import com.saloon.aurora.entity.ReviewEntity;
import com.saloon.aurora.entity.UserEntity;
import com.saloon.aurora.repository.AppointmentRepository;
import com.saloon.aurora.repository.ReviewRepository;
import com.saloon.aurora.repository.UserRepository;
import com.saloon.aurora.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    // Submit Review

    @Override
    public void submitReview(ReviewRequestDto dto, MultipartFile photo, Integer userId) throws IOException {

        // 1.Get appointment
        AppointmentEntity appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 2.Appointment must belong to this user
        if (!appointment.getUser().getId().equals(userId)) {
            throw new RuntimeException("This appointment does not belong to you");
        }

        // 3.Appointment must be Completed (status id = 3)
        if (!appointment.getAppointmentStatus().getId().equals(3)) {
            throw new RuntimeException("You can only review completed appointments");
        }

        // 4.One review per appointment
        if (reviewRepository.existsByAppointment_Id(dto.getAppointmentId())) {
            throw new RuntimeException("You have already reviewed this appointment");
        }

        // 5.Get user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 6.Build and save entity
        ReviewEntity review = new ReviewEntity();
        review.setUser(user);
        review.setAppointment(appointment);
        review.setRating(dto.getRating());
        review.setReviewText(dto.getReviewText());
        review.setUpdated(false);
        review.setCreatedAt(new Date());

        review = reviewRepository.save(review);

        // 7.Save photo locally if provided
        if (photo != null && !photo.isEmpty()) {
            String uploadDir = getReviewImageDir(review.getId());
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }
            Path filePath = Paths.get(uploadDir, "image1.png");
            Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }
    }


    // Update Review

    @Override
    public void updateReview(Integer reviewId, ReviewUpdateRequestDto dto, Integer userId) {

        // 1.Get review
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 2.Only owner can update
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own review");
        }

        // 3.Only allowed once
        if (review.getUpdated()) {
            throw new RuntimeException("You can only update a review once");
        }

        // 4.Update only rating and reviewText
        review.setRating(dto.getRating());
        review.setReviewText(dto.getReviewText());
        review.setUpdated(true);

        reviewRepository.save(review);
    }

    // Delete Review

    @Override
    public void deleteReview(Integer reviewId, Integer userId) throws IOException {

        // 1.Get review
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 2.Only owner can delete
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own review");
        }

        // 3.Delete from DB
        reviewRepository.delete(review);

        // 4.Delete photo folder if exists
        String uploadDir = getReviewImageDir(reviewId);
        File uploadPath = new File(uploadDir);

        System.out.println("Deleting photo folder: " + uploadDir);
        System.out.println("Folder exists: " + uploadPath.exists());

        if (uploadPath.exists()) {
            deleteDirectory(uploadPath);
            System.out.println("Folder deleted successfully");
        }
    }

    // Helper — Get Review Image Directory
    private String getReviewImageDir(Integer reviewId) {
        try {
            String staticPath = new ClassPathResource("static/review_images").getFile().getAbsolutePath();
            return staticPath + "/" + reviewId;
        } catch (IOException e) {
            // Fallback: create the folder relative to classpath root
            String projectRoot = System.getProperty("user.dir");
            return projectRoot + "/src/main/resources/static/review_images/" + reviewId;
        }
    }
    // Get My Reviews

    @Override
    public List<ReviewResponseDto> getMyReviews(Integer userId) {
        List<ReviewEntity> reviews = reviewRepository.findByUser_Id(userId);
        return mapToResponseDtoList(reviews);
    }

    // Get Reviews By Service

    @Override
    public List<ReviewResponseDto> getReviewsByService(Integer serviceId) {
        List<ReviewEntity> reviews = reviewRepository.findByAppointment_Service_Id(serviceId);
        return mapToResponseDtoList(reviews);
    }

    // Helper — Map to Response DTO List

    private List<ReviewResponseDto> mapToResponseDtoList(List<ReviewEntity> reviews) {
        List<ReviewResponseDto> dtos = new ArrayList<>();
        for (ReviewEntity review : reviews) {
            ReviewResponseDto dto = new ReviewResponseDto();
            dto.setId(review.getId());
            dto.setAppointmentId(review.getAppointment().getId());
            dto.setReviewerName(
                    review.getUser().getFirstName() + " " + review.getUser().getLastName()
            );
            dto.setServiceName(
                    review.getAppointment().getService().getTitle()
            );
            dto.setRating(review.getRating());
            dto.setReviewText(review.getReviewText());
            dto.setIsUpdated(review.getUpdated());
            dto.setCreatedAt(review.getCreatedAt());

            // Check if photo exists locally
            String photoPath = getReviewImageDir(review.getId()) + "/image1.png";
            dto.setHasPhoto(new File(photoPath).exists());

            dtos.add(dto);
        }
        return dtos;
    }

// Helper — Delete Directory

    private boolean deleteDirectory(File dir) {
        File[] contents = dir.listFiles();
        if (contents != null) {
            for (File file : contents) {
                deleteDirectory(file);
            }
        }
        return dir.delete();
    }

}
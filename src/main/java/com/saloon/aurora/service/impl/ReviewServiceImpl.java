package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.ReviewRequestDto;
import com.saloon.aurora.dto.ReviewResponseDto;
import com.saloon.aurora.entity.AppointmentEntity;
import com.saloon.aurora.entity.ReviewEntity;
import com.saloon.aurora.entity.UserEntity;
import com.saloon.aurora.repository.AppointmentRepository;
import com.saloon.aurora.repository.ReviewRepository;
import com.saloon.aurora.repository.UserRepository;
import com.saloon.aurora.service.ReviewService;
import lombok.RequiredArgsConstructor;
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

    // ─── Submit Review ────────────────────────────────────────────────────────

    @Override
    public void submitReview(ReviewRequestDto dto, MultipartFile photo, Integer userId) throws IOException {

        // 1. Get appointment
        AppointmentEntity appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 2. Appointment must belong to this user
        if (!appointment.getUser().getId().equals(userId)) {
            throw new RuntimeException("This appointment does not belong to you");
        }

        // 3. Appointment must be Completed (status id = 3)
        if (!appointment.getAppointmentStatus().getId().equals(3)) {
            throw new RuntimeException("You can only review completed appointments");
        }

        // 4. One review per appointment
        if (reviewRepository.existsByAppointment_Id(dto.getAppointmentId())) {
            throw new RuntimeException("You have already reviewed this appointment");
        }

        // 5. Get user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 6. Build and save entity
        ReviewEntity review = new ReviewEntity();
        review.setUser(user);
        review.setAppointment(appointment);
        review.setRating(dto.getRating());
        review.setReviewText(dto.getReviewText());
        review.setCreatedAt(new Date());

        review = reviewRepository.save(review);

        // 7. Save photo locally if provided
        if (photo != null && !photo.isEmpty()) {
            String uploadDir = "src/main/resources/static/review_images/" + review.getId();
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }
            Path filePath = Paths.get(uploadDir, "image1.png");
            Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    // ─── Get My Reviews ───────────────────────────────────────────────────────

    @Override
    public List<ReviewResponseDto> getMyReviews(Integer userId) {
        List<ReviewEntity> reviews = reviewRepository.findByUser_Id(userId);
        return mapToResponseDtoList(reviews);
    }

    // ─── Get Reviews By Service ───────────────────────────────────────────────

    @Override
    public List<ReviewResponseDto> getReviewsByService(Integer serviceId) {
        List<ReviewEntity> reviews = reviewRepository.findByAppointment_Service_Id(serviceId);
        return mapToResponseDtoList(reviews);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private List<ReviewResponseDto> mapToResponseDtoList(List<ReviewEntity> reviews) {
        List<ReviewResponseDto> dtos = new ArrayList<>();
        for (ReviewEntity review : reviews) {
            ReviewResponseDto dto = new ReviewResponseDto();
            dto.setId(review.getId());
            dto.setReviewerName(
                    review.getUser().getFirstName() + " " + review.getUser().getLastName()
            );
            dto.setServiceName(
                    review.getAppointment().getService().getTitle()
            );
            dto.setRating(review.getRating());
            dto.setReviewText(review.getReviewText());
            dto.setCreatedAt(review.getCreatedAt());

            // Check if photo exists locally
            String photoPath = "src/main/resources/static/review_images/"
                    + review.getId() + "/image1.png";
            dto.setHasPhoto(new File(photoPath).exists());

            dtos.add(dto);
        }
        return dtos;
    }

}
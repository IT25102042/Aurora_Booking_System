package com.saloon.aurora.repository;

import com.saloon.aurora.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Integer> {

    // Get all reviews by a specific user (for My Reviews section)
    List<ReviewEntity> findByUser_Id(Integer userId);

    // Get all reviews for a specific service (for Single Service Page)
    List<ReviewEntity> findByAppointment_Service_Id(Integer serviceId);

    // Check if an appointment already has a review (enforce one review per appointment)
    boolean existsByAppointment_Id(Integer appointmentId);

}
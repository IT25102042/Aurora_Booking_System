package com.saloon.aurora.repository;

import com.saloon.aurora.entity.AppointmentStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatusEntity, Integer> {

    Optional<AppointmentStatusEntity> findByAppointmentStatus(String appointmentStatus);

}
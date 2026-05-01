package com.saloon.aurora.repository;

import com.saloon.aurora.entity.AppointmentStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatusEntity, Integer> {

    Optional<AppointmentStatusEntity> findByAppointmentStatus(String appointmentStatus);

    List<AppointmentStatusEntity> findByAppointmentStatusContaining(String keyword);
}

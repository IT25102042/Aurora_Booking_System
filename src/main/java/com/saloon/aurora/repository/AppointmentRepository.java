package com.saloon.aurora.repository;

import com.saloon.aurora.entity.AppointmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Date;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Integer> {

    List<AppointmentEntity> findByStylistProfileIdAndAppointmentDate(
            Integer stylistProfileId,
            Date appointmentDate
    );

    List<AppointmentEntity> findByUserId(Integer userId);

    List<AppointmentEntity> findByAppointmentStatusId(Integer appointmentStatusId);

    List<AppointmentEntity> findByStylistProfileIdAndAppointmentDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Integer stylistProfileId,
            Date appointmentDate,
            LocalTime endTime,
            LocalTime startTime
    );
}
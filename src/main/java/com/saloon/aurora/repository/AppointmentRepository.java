package com.saloon.aurora.repository;

import com.saloon.aurora.entity.AppointmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Integer> {

    List<AppointmentEntity> findByUserId(Integer userId);

    List<AppointmentEntity> findByAppointmentStatusId(Integer appointmentStatusId);

    List<AppointmentEntity> findByAppointmentDate(Date appointmentDate);

    List<AppointmentEntity> findByStylistProfileId(Integer stylistProfileId);

}
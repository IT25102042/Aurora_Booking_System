package com.saloon.aurora.repository;

import com.saloon.aurora.entity.AppointmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Date;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Integer> {
    List<AppointmentEntity> findByUser_Id(Integer userID);

    List<AppointmentEntity> findByStylistProfile_Id(Integer stylistProfileId);

    List<AppointmentEntity> findByAppointmentStatus_Id(Integer statusId);

    List<AppointmentEntity> findByAppointmentDate(Date date);

    List<AppointmentEntity> findByAppointmentDateAndStylistProfile_Id(Date date, Integer stylistId);

    List<AppointmentEntity> findByUser_IdAndAppointmentStatus_Id(Integer userId, Integer statusId);
}

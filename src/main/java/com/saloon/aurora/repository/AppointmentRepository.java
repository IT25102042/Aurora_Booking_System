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

    List<AppointmentEntity> findByStylistProfileIdAndAppointmentDate(
            Integer stylistProfileId,
            Date appointmentDate
    );

    // Find all appointments EXCEPT Cancelled (Status 4) to block slots
    List<AppointmentEntity> findByStylistProfileIdAndAppointmentDateAndAppointmentStatusIdNot(
            Integer stylistProfileId,
            Date appointmentDate,
            Integer statusId
    );

    @org.springframework.data.jpa.repository.Query(value = "SELECT stylist_profile_id FROM service_stylists WHERE service_id = ?1", nativeQuery = true)
    List<Integer> findStylistIdsByServiceId(Integer serviceId);

    // New method for status-based slot blocking (only Confirmed appointments block slots)
    List<AppointmentEntity> findByStylistProfileIdAndAppointmentDateAndAppointmentStatusId(
            Integer stylistProfileId,
            Date appointmentDate,
            Integer appointmentStatusId
    );

    // FIX: Use DATE() to ignore the time component in the database when checking for booked slots
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM appointments WHERE stylist_profiles_id = ?1 AND DATE(appointment_date) = DATE(?2) AND appointment_status_id != ?3", nativeQuery = true)
    List<AppointmentEntity> findBookedSlotsByDateIgnoreTime(Integer stylistId, Date date, Integer statusId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM appointments WHERE stylist_profiles_id = ?1 AND DATE(appointment_date) = DATE(?2) AND appointment_status_id = ?3", nativeQuery = true)
    List<AppointmentEntity> findConfirmedSlotsByDateIgnoreTime(Integer stylistId, Date date, Integer statusId);

}
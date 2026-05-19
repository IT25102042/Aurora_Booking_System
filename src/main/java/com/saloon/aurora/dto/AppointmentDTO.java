package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private Integer id;

    // User
    private Integer userId;
    private String userName;

    // Appointment Details
    private String fullName;
    private String contactNo;

    // Service
    private Integer serviceId;
    private String serviceName;
    private Integer durationMinutes;

    // Stylist
    private Integer stylistProfileId;
    private String stylistName;

    // Date & Time
    private Date appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;

    // Extra
    private String specialRequests;
    private Double price;
    private Double total;

    // Payment
    private Integer paymentMethodId;
    private String paymentMethod;

    // Status
    private Integer appointmentStatusId;
    private String appointmentStatus;

    // Created Date
    private Date createdAt;
}
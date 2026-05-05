package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {

    private Integer id;

    private Integer userId;
    private String userName;
    private String contactNo;

    private Integer serviceId;
    private String serviceName;
    private Double servicePrice;

    private Integer stylistProfileId;
    private String stylistName;
    private String stylistRole;

    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String specialRequests;

    private Double total;

    private Integer paymentMethodId;
    private String paymentMethod;

    private Integer appointmentStatusId;
    private String appointmentStatus;

    private LocalDateTime createdAt;
}
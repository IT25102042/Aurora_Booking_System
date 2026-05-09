package com.saloon.aurora.service;

import com.saloon.aurora.dto.AppointmentDTO;
import com.saloon.aurora.entity.*;
import com.saloon.aurora.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private StylistProfileRepository stylistProfileRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private AppointmentStatusRepository appointmentStatusRepository;

    public AppointmentDTO createAppointment(AppointmentDTO dto) {

        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        StylistProfileEntity stylistProfile = stylistProfileRepository.findById(dto.getStylistProfileId())
                .orElseThrow(() -> new RuntimeException("Stylist profile not found"));

        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(dto.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        AppointmentStatusEntity appointmentStatus = appointmentStatusRepository.findById(dto.getAppointmentStatusId())
                .orElseThrow(() -> new RuntimeException("Appointment status not found"));

        AppointmentEntity appointment = new AppointmentEntity();

        appointment.setUser(user);
        appointment.setFullName(dto.getFullName());
        appointment.setContactNo(dto.getContactNo());
        appointment.setService(service);
        appointment.setStylistProfile(stylistProfile);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setSpecialRequests(dto.getSpecialRequests());
        appointment.setTotal(dto.getTotal());
        appointment.setPaymentMethod(paymentMethod);
        appointment.setAppointmentStatus(appointmentStatus);
        appointment.setCreatedAt(new Date());

        AppointmentEntity savedAppointment = appointmentRepository.save(appointment);

        return mapToDTO(savedAppointment);
    }

    public List<AppointmentDTO> getAllAppointments() {

        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Integer id) {

        AppointmentEntity appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        return mapToDTO(appointment);
    }

    public List<AppointmentDTO> getAppointmentsByUser(Integer userId) {

        return appointmentRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByStatus(Integer statusId) {

        return appointmentRepository.findByAppointmentStatusId(statusId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByStylist(Integer stylistId) {

        return appointmentRepository.findByStylistProfileId(stylistId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO updateAppointment(Integer id, AppointmentDTO dto) {

        AppointmentEntity appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        StylistProfileEntity stylistProfile = stylistProfileRepository.findById(dto.getStylistProfileId())
                .orElseThrow(() -> new RuntimeException("Stylist profile not found"));

        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(dto.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        AppointmentStatusEntity appointmentStatus = appointmentStatusRepository.findById(dto.getAppointmentStatusId())
                .orElseThrow(() -> new RuntimeException("Appointment status not found"));

        appointment.setUser(user);
        appointment.setFullName(dto.getFullName());
        appointment.setContactNo(dto.getContactNo());
        appointment.setService(service);
        appointment.setStylistProfile(stylistProfile);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setSpecialRequests(dto.getSpecialRequests());
        appointment.setTotal(dto.getTotal());
        appointment.setPaymentMethod(paymentMethod);
        appointment.setAppointmentStatus(appointmentStatus);

        AppointmentEntity updatedAppointment = appointmentRepository.save(appointment);

        return mapToDTO(updatedAppointment);
    }

    public void deleteAppointment(Integer id) {

        AppointmentEntity appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointmentRepository.delete(appointment);
    }

    private AppointmentDTO mapToDTO(AppointmentEntity appointment) {

        AppointmentDTO dto = new AppointmentDTO();

        dto.setId(appointment.getId());

        dto.setUserId(appointment.getUser().getId());
        dto.setUserName(
                appointment.getUser().getFirstName() + " " +
                        appointment.getUser().getLastName()
        );

        dto.setFullName(appointment.getFullName());
        dto.setContactNo(appointment.getContactNo());

        dto.setServiceId(appointment.getService().getId());
        dto.setServiceName(appointment.getService().getTitle());

        dto.setStylistProfileId(appointment.getStylistProfile().getId());
        dto.setStylistName(
                appointment.getStylistProfile().getUser().getFirstName() + " " +
                        appointment.getStylistProfile().getUser().getLastName()
        );

        dto.setAppointmentDate(appointment.getAppointmentDate());

        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());

        dto.setSpecialRequests(appointment.getSpecialRequests());

        dto.setTotal(appointment.getTotal());

        dto.setPaymentMethodId(appointment.getPaymentMethod().getId());
        dto.setPaymentMethod(
                appointment.getPaymentMethod().getPaymentMethod()
        );

        dto.setAppointmentStatusId(
                appointment.getAppointmentStatus().getId()
        );

        dto.setAppointmentStatus(
                appointment.getAppointmentStatus().getAppointmentStatus()
        );

        dto.setCreatedAt(appointment.getCreatedAt());

        return dto;
    }
}
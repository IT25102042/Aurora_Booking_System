package com.saloon.aurora.service;

import com.saloon.aurora.dto.AppointmentRequestDTO;
import com.saloon.aurora.dto.AppointmentResponseDTO;
import com.saloon.aurora.entity.*;
import com.saloon.aurora.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private StylistProfileRepository stylistProfileRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;
    @Autowired private AppointmentStatusRepository appointmentStatusRepository;

    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO dto) {

        AppointmentEntity appointment = buildAppointmentFromDTO(new AppointmentEntity(), dto);

        AppointmentStatusEntity status = appointmentStatusRepository
                .findByAppointmentStatus("PENDING")
                .orElseThrow(() -> new RuntimeException("Default status not found"));
        appointment.setAppointmentStatus(status);

        appointment.setCreatedAt(new Date());

        AppointmentEntity saved = appointmentRepository.save(appointment);
        return toResponseDTO(saved);
    }

    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDTO getAppointmentById(Integer id) {
        AppointmentEntity appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        return toResponseDTO(appointment);
    }

    public AppointmentResponseDTO updateAppointment(Integer id, AppointmentRequestDTO dto) {
        AppointmentEntity appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        buildAppointmentFromDTO(appointment, dto);

        AppointmentEntity updated = appointmentRepository.save(appointment);
        return toResponseDTO(updated);
    }

    public void deleteAppointment(Integer id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    private AppointmentEntity buildAppointmentFromDTO(AppointmentEntity appointment, AppointmentRequestDTO dto) {

        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + dto.getUserId()));

        ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found: " + dto.getServiceId()));

        StylistProfileEntity stylist = stylistProfileRepository.findById(dto.getStylistProfileId())
                .orElseThrow(() -> new RuntimeException("Stylist not found: " + dto.getStylistProfileId()));

        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(dto.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found: " + dto.getPaymentMethodId()));

        appointment.setUser(user);
        appointment.setService(service);
        appointment.setStylistProfile(stylist);
        appointment.setFullName(user.getFullName());
        appointment.setContactNo(user.getContactNo());

        appointment.setAppointmentDate(
                Date.from(dto.getAppointmentDate()
                        .atStartOfDay(ZoneId.systemDefault()).toInstant())
        );

        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());

        appointment.setSpecialRequests(dto.getSpecialRequests());

        appointment.setTotal(service.getPrice());

        appointment.setPaymentMethod(paymentMethod);

        return appointment;
    }

    private AppointmentResponseDTO toResponseDTO(AppointmentEntity a) {

        AppointmentResponseDTO dto = new AppointmentResponseDTO();

        dto.setId(a.getId());

        dto.setUserId(a.getUser().getId());
        dto.setUserName(a.getUser().getFirstName() + " " + a.getUser().getLastName());
        dto.setContactNo(a.getContactNo());

        dto.setServiceId(a.getService().getId());
        dto.setServiceName(a.getService().getTitle());
        dto.setServicePrice(a.getService().getPrice());

        dto.setStylistProfileId(a.getStylistProfile().getId());
        dto.setStylistName(
                a.getStylistProfile().getUser().getFirstName() + " " +
                        a.getStylistProfile().getUser().getLastName()
        );
        dto.setStylistRole(a.getStylistProfile().getStylistRole().getStylistRole());

        dto.setAppointmentDate(
                a.getAppointmentDate().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate()
        );

        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());

        dto.setSpecialRequests(a.getSpecialRequests());
        dto.setTotal(a.getTotal());

        dto.setPaymentMethodId(a.getPaymentMethod().getId());
        dto.setPaymentMethod(a.getPaymentMethod().getPaymentMethod());

        dto.setAppointmentStatusId(a.getAppointmentStatus().getId());
        dto.setAppointmentStatus(a.getAppointmentStatus().getAppointmentStatus());

        dto.setCreatedAt(
                a.getCreatedAt().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
        );

        return dto;
    }
}
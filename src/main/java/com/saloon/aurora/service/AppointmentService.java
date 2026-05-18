package com.saloon.aurora.service;

import com.saloon.aurora.dto.AppointmentDTO;
import com.saloon.aurora.entity.*;
import com.saloon.aurora.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import java.time.LocalTime;
import java.util.ArrayList;

@Service
@Transactional
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


// Check existing appointments for this stylist
        List<AppointmentEntity> existingAppointments =
                appointmentRepository.findByStylistProfileId(stylistProfile.getId());

        for (AppointmentEntity existing : existingAppointments) {

            // Only check appointments on same date (ignoring time)
            if (!isSameDay(existing.getAppointmentDate(), dto.getAppointmentDate())) {
                continue;
            }

            // Check overlapping time
            boolean overlaps =
                    dto.getStartTime().isBefore(existing.getEndTime()) &&
                            dto.getEndTime().isAfter(existing.getStartTime());

            if (overlaps) {
                throw new RuntimeException("This time slot is already booked.");
            }
        }


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

    public List<String> getAvailableSlots(Integer stylistId, Date date) {
        System.out.println("Checking available slots for stylist: " + stylistId + " on date: " + date);

        // Hide all appointments that are NOT Cancelled (Status ID 4)
        // FIX: Use the new repository method that ignores the time part of the appointment_date
        // UPDATED: Now blocks BOTH Pending and Confirmed (anything except Cancelled)
        List<AppointmentEntity> bookedAppointments =
                appointmentRepository.findBookedSlotsByDateIgnoreTime(
                        stylistId,
                        date,
                        4
                );

        List<LocalTime> workingHours = List.of(
                LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
                LocalTime.of(12, 0), LocalTime.of(13, 0), LocalTime.of(14, 0),
                LocalTime.of(15, 0), LocalTime.of(16, 0), LocalTime.of(17, 0)
        );

        LocalTime now = LocalTime.now();
        Date today = new Date();
        boolean isToday = isSameDay(date, today);

        List<String> availableSlots = new ArrayList<>();
        for (LocalTime slot : workingHours) {
            // 1. Check if time is in the past (only if date is today)
            if (isToday && slot.isBefore(now)) {
                continue;
            }

            // 2. Check if slot is already booked
            boolean isBooked = false;
            for (AppointmentEntity app : bookedAppointments) {
                if (app.getStartTime().equals(slot)) {
                    isBooked = true;
                    break;
                }
            }

            if (!isBooked) {
                availableSlots.add(slot.toString());
            }
        }

        System.out.println("Found " + availableSlots.size() + " available slots.");
        return availableSlots;
    }

    private boolean isSameDay(Date date1, Date date2) {
        java.util.Calendar cal1 = java.util.Calendar.getInstance();
        java.util.Calendar cal2 = java.util.Calendar.getInstance();
        cal1.setTime(date1);
        cal2.setTime(date2);
        return cal1.get(java.util.Calendar.YEAR) == cal2.get(java.util.Calendar.YEAR) &&
                cal1.get(java.util.Calendar.DAY_OF_YEAR) == cal2.get(java.util.Calendar.DAY_OF_YEAR);
    }

    @Transactional(readOnly = true)
    public AppointmentDTO getServiceDetails(Integer serviceId) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        AppointmentDTO dto = new AppointmentDTO();
        dto.setServiceId(service.getId());
        dto.setServiceName(service.getTitle());
        dto.setPrice(service.getPrice());
        dto.setTotal(service.getPrice()); // Setting both for compatibility
        dto.setSpecialRequests(service.getDescription());
        dto.setDurationMinutes(service.getDurationMinutes());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getStylistsForService(Integer serviceId) {
        try {
            System.out.println("Fetching stylist IDs for service: " + serviceId);
            List<Integer> stylistIds = appointmentRepository.findStylistIdsByServiceId(serviceId);

            List<StylistProfileEntity> stylists;

            if (stylistIds == null || stylistIds.isEmpty()) {
                System.out.println("No stylists linked to service " + serviceId + ".");
                stylists = new ArrayList<>(); // Return empty list, no fallback
            } else {
                System.out.println("Found " + stylistIds.size() + " stylist IDs. Loading profiles...");
                stylists = stylistProfileRepository.findAllById(stylistIds);
            }

            return mapStylistsToDtos(stylists);

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in getStylistsForService: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private List<AppointmentDTO> mapStylistsToDtos(List<StylistProfileEntity> stylists) {
        return stylists.stream()
                .map(stylist -> {
                    AppointmentDTO dto = new AppointmentDTO();
                    dto.setStylistProfileId(stylist.getId());
                    if (stylist.getUser() != null) {
                        dto.setStylistName(stylist.getUser().getFirstName() + " " + stylist.getUser().getLastName());
                    } else {
                        dto.setStylistName("Unknown Stylist");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
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
        dto.setDurationMinutes(appointment.getService().getDurationMinutes());

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
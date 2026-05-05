package com.saloon.aurora.controller;

import com.saloon.aurora.entity.*;
import com.saloon.aurora.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lookup")
@CrossOrigin(origins = "*")
public class LookupController {

    @Autowired private UserRepository userRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private StylistProfileRepository stylistProfileRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;
    @Autowired private AppointmentStatusRepository appointmentStatusRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserEntity>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceEntity>> getServices() {
        return ResponseEntity.ok(serviceRepository.findAll());
    }

    @GetMapping("/stylists")
    public ResponseEntity<List<StylistProfileEntity>> getStylists() {
        return ResponseEntity.ok(stylistProfileRepository.findAll());
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodEntity>> getPaymentMethods() {
        return ResponseEntity.ok(paymentMethodRepository.findAll());
    }

    @GetMapping("/appointment-statuses")
    public ResponseEntity<List<AppointmentStatusEntity>> getAppointmentStatuses() {
        return ResponseEntity.ok(appointmentStatusRepository.findAll());
    }
}
package com.saloon.aurora.controller;

import com.saloon.aurora.dto.AppointmentDTO;
import com.saloon.aurora.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public AppointmentDTO createAppointment(
            @RequestBody AppointmentDTO dto) {

        return appointmentService.createAppointment(dto);
    }

    @GetMapping
    public List<AppointmentDTO> getAllAppointments() {

        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public AppointmentDTO getAppointmentById(
            @PathVariable Integer id) {

        return appointmentService.getAppointmentById(id);
    }

    @GetMapping("/user/{userId}")
    public List<AppointmentDTO> getAppointmentsByUser(
            @PathVariable Integer userId) {

        return appointmentService.getAppointmentsByUser(userId);
    }

    @GetMapping("/status/{statusId}")
    public List<AppointmentDTO> getAppointmentsByStatus(
            @PathVariable Integer statusId) {

        return appointmentService.getAppointmentsByStatus(statusId);
    }

    @GetMapping("/stylist/{stylistId}")
    public List<AppointmentDTO> getAppointmentsByStylist(
            @PathVariable Integer stylistId) {

        return appointmentService.getAppointmentsByStylist(stylistId);
    }

    @PutMapping("/{id}")
    public AppointmentDTO updateAppointment(
            @PathVariable Integer id,
            @RequestBody AppointmentDTO dto) {

        return appointmentService.updateAppointment(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deleteAppointment(@PathVariable Integer id) {

        appointmentService.deleteAppointment(id);

        return "Appointment deleted successfully";
    }
}
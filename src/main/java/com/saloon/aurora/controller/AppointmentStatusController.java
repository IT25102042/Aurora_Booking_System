package com.saloon.aurora.controller;

import com.saloon.aurora.dto.AppointmentStatusDTO;
import com.saloon.aurora.service.AppointmentStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment-status")
@CrossOrigin
public class AppointmentStatusController {

    @Autowired
    private AppointmentStatusService appointmentStatusService;

    @PostMapping
    public AppointmentStatusDTO createStatus(
            @RequestBody AppointmentStatusDTO dto) {

        return appointmentStatusService.createStatus(dto);
    }

    @GetMapping
    public List<AppointmentStatusDTO> getAllStatuses() {

        return appointmentStatusService.getAllStatuses();
    }

    @GetMapping("/{id}")
    public AppointmentStatusDTO getStatusById(
            @PathVariable Integer id) {

        return appointmentStatusService.getStatusById(id);
    }

    @PutMapping("/{id}")
    public AppointmentStatusDTO updateStatus(
            @PathVariable Integer id,
            @RequestBody AppointmentStatusDTO dto) {

        return appointmentStatusService.updateStatus(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deleteStatus(@PathVariable Integer id) {

        appointmentStatusService.deleteStatus(id);

        return "Appointment status deleted successfully";
    }
}
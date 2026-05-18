package com.saloon.aurora.service;

import com.saloon.aurora.dto.AppointmentStatusDTO;
import com.saloon.aurora.entity.AppointmentStatusEntity;
import com.saloon.aurora.repository.AppointmentStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentStatusService {

    @Autowired
    private AppointmentStatusRepository appointmentStatusRepository;

    public AppointmentStatusDTO createStatus(AppointmentStatusDTO dto) {

        AppointmentStatusEntity entity = new AppointmentStatusEntity();

        entity.setAppointmentStatus(dto.getAppointmentStatus());

        AppointmentStatusEntity savedEntity =
                appointmentStatusRepository.save(entity);

        return mapToDTO(savedEntity);
    }

    public List<AppointmentStatusDTO> getAllStatuses() {

        return appointmentStatusRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentStatusDTO getStatusById(Integer id) {

        AppointmentStatusEntity entity =
                appointmentStatusRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Appointment status not found"));

        return mapToDTO(entity);
    }

    public AppointmentStatusDTO updateStatus(Integer id,
                                             AppointmentStatusDTO dto) {

        AppointmentStatusEntity entity =
                appointmentStatusRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Appointment status not found"));

        entity.setAppointmentStatus(dto.getAppointmentStatus());

        AppointmentStatusEntity updatedEntity =
                appointmentStatusRepository.save(entity);

        return mapToDTO(updatedEntity);
    }

    public void deleteStatus(Integer id) {

        AppointmentStatusEntity entity =
                appointmentStatusRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Appointment status not found"));

        appointmentStatusRepository.delete(entity);
    }

    private AppointmentStatusDTO mapToDTO(AppointmentStatusEntity entity) {

        AppointmentStatusDTO dto = new AppointmentStatusDTO();

        dto.setId(entity.getId());
        dto.setAppointmentStatus(entity.getAppointmentStatus());

        return dto;
    }
}
package com.saloon.aurora.service;


import com.saloon.aurora.dto.ServiceDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ServiceService {
    List<ServiceDto> getAllServices();
    void addService(ServiceDto serviceDto, MultipartFile image1, MultipartFile image2, MultipartFile image3) throws IOException;
    void updateService(ServiceDto serviceDto, MultipartFile image1, MultipartFile image2, MultipartFile image3) throws IOException;
    void deleteService(Integer id);
    List<ServiceDto> getServicesByStylistProfileId(Integer stylistId);
    void assignStylistToService(Integer serviceId, Integer stylistProfileId);
    void unassignStylistFromService(Integer serviceId, Integer stylistProfileId);
    List<Map<String, Object>> getAllServiceStylistAssignments();
}

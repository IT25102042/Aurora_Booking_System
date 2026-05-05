package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.ServiceDto;
import com.saloon.aurora.entity.CategoryEntity;
import com.saloon.aurora.entity.GenderEntity;
import com.saloon.aurora.entity.ServiceEntity;
import com.saloon.aurora.entity.ServiceStatusEntity;
import com.saloon.aurora.repository.CategoryRepository;
import com.saloon.aurora.repository.GenderRepository;
import com.saloon.aurora.repository.ServiceRepository;
import com.saloon.aurora.repository.ServiceStatusRepository;
import com.saloon.aurora.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    final ServiceRepository serviceRepository;
    final CategoryRepository categoryRepository;
    final GenderRepository genderRepository;
    final ServiceStatusRepository serviceStatusRepository;
    final ModelMapper modelMapper;

    @Override
    public List<ServiceDto> getAllServices() {
        List<ServiceEntity> serviceEntities = serviceRepository.findAll();
        List<ServiceDto> serviceDtos = new ArrayList<>();

        for (ServiceEntity entity : serviceEntities) {
            ServiceDto dto = modelMapper.map(entity, ServiceDto.class);
            if (entity.getCategory() != null) {
                dto.setCategoryId(entity.getCategory().getId());
                dto.setCategoryName(entity.getCategory().getCategory());
            }
            if (entity.getGender() != null) {
                dto.setGenderId(entity.getGender().getId());
                dto.setGenderName(entity.getGender().getGender());
            }
            if (entity.getServiceStatus() != null) {
                dto.setServiceStatusId(entity.getServiceStatus().getId());
                dto.setServiceStatusName(entity.getServiceStatus().getServiceStatus());
            }
            serviceDtos.add(dto);
        }
        return serviceDtos;
    }

    @Override
    public void addService(ServiceDto serviceDto, MultipartFile image1, MultipartFile image2, MultipartFile image3) throws IOException {

        // Check if service already exists
        if (serviceRepository.existsByTitleIgnoreCase(serviceDto.getTitle())) {
            throw new RuntimeException("Service with this title already exists!");
        }

        ServiceEntity serviceEntity = new ServiceEntity();
        serviceEntity.setTitle(serviceDto.getTitle());
        serviceEntity.setDescription(serviceDto.getDescription());
        serviceEntity.setPrice(serviceDto.getPrice());
        serviceEntity.setDurationMinutes(serviceDto.getDurationMinutes());
        serviceEntity.setCreatedAt(new Date());

        CategoryEntity category = categoryRepository.findById(serviceDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        serviceEntity.setCategory(category);

        GenderEntity gender = genderRepository.findById(serviceDto.getGenderId())
                .orElseThrow(() -> new RuntimeException("Gender not found"));
        serviceEntity.setGender(gender);

        ServiceStatusEntity status = serviceStatusRepository.findById(serviceDto.getServiceStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found"));
        serviceEntity.setServiceStatus(status);

        // Save service to DB to get its ID
        serviceEntity = serviceRepository.save(serviceEntity);

        // Define directory to save images
        String uploadDir = "src/main/resources/static/service_images/" + serviceEntity.getId();
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) {
            uploadPath.mkdirs();
        }

        // Save Image 1 (Required)
        if (image1 != null && !image1.isEmpty()) {
            Path filePath = Paths.get(uploadDir, "image1.png");
            Files.copy(image1.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Save Image 2 (Optional)
        if (image2 != null && !image2.isEmpty()) {
            Path filePath = Paths.get(uploadDir, "image2.png");
            Files.copy(image2.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Save Image 3 (Optional)
        if (image3 != null && !image3.isEmpty()) {
            Path filePath = Paths.get(uploadDir, "image3.png");
            Files.copy(image3.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    @Override
    public void updateService(ServiceDto serviceDto, MultipartFile image1, MultipartFile image2, MultipartFile image3) throws IOException {
        ServiceEntity serviceEntity = serviceRepository.findById(serviceDto.getId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Check if another service has the same title (excluding current)
        serviceRepository.findByTitleIgnoreCase(serviceDto.getTitle())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(serviceDto.getId())) {
                        throw new RuntimeException("Another service with this title already exists!");
                    }
                });

        serviceEntity.setTitle(serviceDto.getTitle());
        serviceEntity.setDescription(serviceDto.getDescription());
        serviceEntity.setPrice(serviceDto.getPrice());
        serviceEntity.setDurationMinutes(serviceDto.getDurationMinutes());

        CategoryEntity category = categoryRepository.findById(serviceDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        serviceEntity.setCategory(category);

        GenderEntity gender = genderRepository.findById(serviceDto.getGenderId())
                .orElseThrow(() -> new RuntimeException("Gender not found"));
        serviceEntity.setGender(gender);

        ServiceStatusEntity status = serviceStatusRepository.findById(serviceDto.getServiceStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found"));
        serviceEntity.setServiceStatus(status);

        serviceRepository.save(serviceEntity);

        // Update images if provided
        String uploadDir = "src/main/resources/static/service_images/" + serviceEntity.getId();
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) {
            uploadPath.mkdirs();
        }

        // Update Image 1 if provided
        if (image1 != null && !image1.isEmpty()) {
            Path filePath = Paths.get(uploadDir, "image1.png");
            Files.copy(image1.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Update Image 2 if provided
        if (image2 != null && !image2.isEmpty()) {
            Path filePath = Paths.get(uploadDir, "image2.png");
            Files.copy(image2.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Update Image 3 if provided
        if (image3 != null && !image3.isEmpty()) {
            Path filePath = Paths.get(uploadDir, "image3.png");
            Files.copy(image3.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }

    }

    @Override
    public void deleteService(Integer id) {
        ServiceEntity serviceEntity = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // 1. Delete Service from DB
        serviceRepository.delete(serviceEntity);

        // 2. Delete associated images directory
        String uploadDir = "src/main/resources/static/service_images/" + id;
        File uploadPath = new File(uploadDir);
        if (uploadPath.exists()) {
            deleteDirectory(uploadPath);
        }
    }

    // Helper method to delete directory recursively
    private boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }
}

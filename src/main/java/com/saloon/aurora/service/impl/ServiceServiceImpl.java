package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.ServiceDto;
import com.saloon.aurora.entity.ServiceEntity;
import com.saloon.aurora.repository.ServiceRepository;
import com.saloon.aurora.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    final ServiceRepository serviceRepository;
    final ModelMapper modelMapper;

    @Override
    public void registerService(ServiceDto serviceDto) {

        ServiceEntity serviceEntity = modelMapper.map(serviceDto, ServiceEntity.class);
        
        if (serviceDto.getCategoryId() != null) {
            com.saloon.aurora.entity.CategoryEntity category = new com.saloon.aurora.entity.CategoryEntity();
            category.setId(serviceDto.getCategoryId());
            serviceEntity.setCategory(category);
        }
        
        if (serviceDto.getGenderId() != null) {
            com.saloon.aurora.entity.GenderEntity gender = new com.saloon.aurora.entity.GenderEntity();
            gender.setId(serviceDto.getGenderId());
            serviceEntity.setGender(gender);
        }
        
        if (serviceDto.getServiceStatusId() != null) {
            com.saloon.aurora.entity.ServiceStatusEntity status = new com.saloon.aurora.entity.ServiceStatusEntity();
            status.setId(serviceDto.getServiceStatusId());
            serviceEntity.setServiceStatus(status);
        }

        serviceRepository.save(serviceEntity);

    }

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
}

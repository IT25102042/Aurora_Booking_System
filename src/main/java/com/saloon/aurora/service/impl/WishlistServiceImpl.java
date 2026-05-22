package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.ServiceDto;
import com.saloon.aurora.entity.ServiceEntity;
import com.saloon.aurora.entity.UserEntity;
import com.saloon.aurora.repository.ServiceRepository;
import com.saloon.aurora.repository.UserRepository;
import com.saloon.aurora.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDto> getWishlist(Integer userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Set<ServiceEntity> wishlist = user.getWishlistServices();
        List<ServiceDto> serviceDtos = new ArrayList<>();

        for (ServiceEntity entity : wishlist) {
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
    @Transactional
    public void addToWishlist(Integer userId, Integer serviceId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        user.getWishlistServices().add(service);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Integer userId, Integer serviceId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        user.getWishlistServices().remove(service);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWished(Integer userId, Integer serviceId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Set<ServiceEntity> wishlist = user.getWishlistServices();
        if (wishlist == null) return false;
        return wishlist.stream()
                .filter(service -> service != null && service.getId() != null)
                .anyMatch(service -> service.getId().equals(serviceId));
    }
}

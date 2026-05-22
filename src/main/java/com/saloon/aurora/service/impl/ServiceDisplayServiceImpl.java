package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.dto.GenderDto;
import com.saloon.aurora.dto.ServiceDto;
import com.saloon.aurora.entity.ServiceEntity;
import com.saloon.aurora.repository.CategoryRepository;
import com.saloon.aurora.repository.GenderRepository;
import com.saloon.aurora.repository.ServiceRepository;
import com.saloon.aurora.service.ServiceDisplayService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceDisplayServiceImpl implements ServiceDisplayService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;
    private final GenderRepository genderRepository;
    private final ModelMapper modelMapper;

    @Override
    public Map<String, Object> getActiveServices(
            String searchQuery,
            List<Integer> categoryIds,
            List<Integer> genderIds,
            Double maxPrice,
            List<Integer> durations,
            String sortBy,
            int page,
            int size
    ) {
        // Build dynamic specification for filtering
        Specification<ServiceEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only active/available services
            predicates.add(cb.equal(cb.lower(root.get("serviceStatus").get("serviceStatus")), "available"));

            // Search by title
            if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + searchQuery.trim().toLowerCase() + "%"));
            }

            // Filter by category IDs
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            // Filter by gender IDs
            if (genderIds != null && !genderIds.isEmpty()) {
                predicates.add(root.get("gender").get("id").in(genderIds));
            }

            // Filter by max price
            if (maxPrice != null && maxPrice > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Filter by duration values
            if (durations != null && !durations.isEmpty()) {
                predicates.add(root.get("durationMinutes").in(durations));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Build sort
        Sort sort = buildSort(sortBy);

        // Build pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        // Execute query
        Page<ServiceEntity> servicePage = serviceRepository.findAll(spec, pageable);

        // Convert to DTOs
        List<ServiceDto> serviceDtos = servicePage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Build response map
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("services", serviceDtos);
        response.put("currentPage", servicePage.getNumber());
        response.put("totalPages", servicePage.getTotalPages());
        response.put("totalElements", servicePage.getTotalElements());
        response.put("pageSize", servicePage.getSize());

        return response;
    }

    @Override
    public List<CategoryDto> getFilterCategories() {
        List<CategoryDto> categoryDtoList = new ArrayList<>();
        categoryRepository.findAll().forEach(entity -> {
            categoryDtoList.add(modelMapper.map(entity, CategoryDto.class));
        });
        return categoryDtoList;
    }

    @Override
    public List<GenderDto> getFilterGenders() {
        List<GenderDto> genderDtoList = new ArrayList<>();
        genderRepository.findAll().forEach(entity -> {
            genderDtoList.add(modelMapper.map(entity, GenderDto.class));
        });
        return genderDtoList;
    }

    @Override
    public List<Integer> getAvailableDurations() {
        // Get distinct durations from active services only
        List<ServiceEntity> activeServices = serviceRepository
                .findByServiceStatus_ServiceStatusIgnoreCase("Available");

        return activeServices.stream()
                .map(ServiceEntity::getDurationMinutes)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public Double getMaxPrice() {
        List<ServiceEntity> activeServices = serviceRepository
                .findByServiceStatus_ServiceStatusIgnoreCase("Available");

        return activeServices.stream()
                .map(ServiceEntity::getPrice)
                .max(Double::compareTo)
                .orElse(500.0);
    }

    @Override
    public ServiceDto getServiceById(Integer id) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!entity.getServiceStatus().getServiceStatus().equalsIgnoreCase("Available")) {
            throw new RuntimeException("Service is not available");
        }

        return mapToDto(entity);
    }

    @Override
    public List<ServiceDto> getRelatedServices(Integer id, int limit) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Get services in the same category, excluding the current one, and limit the result
        return serviceRepository.findAll().stream()
                .filter(s -> s.getServiceStatus().getServiceStatus().equalsIgnoreCase("Available"))
                .filter(s -> !s.getId().equals(id))
                .filter(s -> s.getCategory().getId().equals(service.getCategory().getId()))
                .limit(limit)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ===== Helper Methods =====

    private ServiceDto mapToDto(ServiceEntity entity) {
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

        if (entity.getStylistProfiles() != null && !entity.getStylistProfiles().isEmpty()) {
            List<Map<String, Object>> stylists = new ArrayList<>();
            for (com.saloon.aurora.entity.StylistProfileEntity stylist : entity.getStylistProfiles()) {
                Map<String, Object> stylistMap = new LinkedHashMap<>();
                stylistMap.put("id", stylist.getId());
                stylistMap.put("userId", stylist.getUser().getId());
                stylistMap.put("firstName", stylist.getUser().getFirstName());
                stylistMap.put("lastName", stylist.getUser().getLastName());
                stylistMap.put("role", stylist.getStylistRole().getStylistRole());
                stylistMap.put("status", stylist.getStylistStatus().getStylistStatus());
                stylists.add(stylistMap);
            }
            dto.setStylists(stylists);
        }

        return dto;
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null || sortBy.isEmpty() || sortBy.equalsIgnoreCase("recommended")) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        switch (sortBy.toLowerCase()) {
            case "pricelowhigh":
                return Sort.by(Sort.Direction.ASC, "price");
            case "pricehighlow":
                return Sort.by(Sort.Direction.DESC, "price");
            case "durationshortlong":
                return Sort.by(Sort.Direction.ASC, "durationMinutes");
            default:
                return Sort.by(Sort.Direction.DESC, "createdAt");
        }
    }
}

package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.StylistProfileDTO;
import com.saloon.aurora.entity.StylistProfileEntity;
import com.saloon.aurora.entity.StylistRoleEntity;
import com.saloon.aurora.entity.StylistStatusEntity;
import com.saloon.aurora.entity.UserEntity;
import com.saloon.aurora.repository.StylistProfileRepository;
import com.saloon.aurora.repository.StylistRoleRepository;
import com.saloon.aurora.repository.StylistStatusRepository;
import com.saloon.aurora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class StylistProfileServiceImpl {

    @Autowired
    private StylistProfileRepository stylistProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StylistRoleRepository stylistRoleRepository;

    @Autowired
    private StylistStatusRepository stylistStatusRepository;

    public List<StylistProfileDTO> getAllStylistProfiles() {
        return stylistProfileRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();

    }

    private StylistProfileDTO convertToDTO(StylistProfileEntity entity){

        StylistProfileDTO dto = new StylistProfileDTO();

        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setFirstName(entity.getUser().getFirstName());
        dto.setLastName(entity.getUser().getLastName());
        dto.setEmail(entity.getUser().getEmail());
        dto.setMobile(entity.getUser().getMobile());

        dto.setStylistRoleId(entity.getStylistRole().getId());
        dto.setStylistRoleName(entity.getStylistRole().getStylistRole());

        dto.setStylistStatusId(entity.getStylistStatus().getId());
        dto.setStylistStatusName(entity.getStylistStatus().getStylistStatus());

        dto.setExperienceYears(entity.getExperienceYears());
        dto.setBio(entity.getBio());

        return dto;

    }

    public List<StylistProfileDTO> searchStylists(String keyword) {

        return stylistProfileRepository
                .findByUser_EmailContainingIgnoreCaseOrUser_MobileContaining(keyword, keyword)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    public StylistProfileDTO createStylistProfile(StylistProfileDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        StylistRoleEntity role = stylistRoleRepository.findById(dto.getStylistRoleId())
                .orElseThrow(() -> new RuntimeException("Stylist Role not found"));

        StylistStatusEntity status = stylistStatusRepository.findById(dto.getStylistStatusId())
                .orElseThrow(() -> new RuntimeException("Stylist Status not found"));

        StylistProfileEntity entity = new StylistProfileEntity();
        entity.setUser(user);
        entity.setStylistRole(role);
        entity.setStylistStatus(status);
        entity.setExperienceYears(dto.getExperienceYears());
        entity.setBio(dto.getBio());

        StylistProfileEntity savedEntity = stylistProfileRepository.save(entity);
        return convertToDTO(savedEntity);
    }

    public StylistProfileDTO updateStylistProfile(Integer id, StylistProfileDTO dto) {
        StylistProfileEntity entity = stylistProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stylist Profile not found"));

        StylistRoleEntity role = stylistRoleRepository.findById(dto.getStylistRoleId())
                .orElseThrow(() -> new RuntimeException("Stylist Role not found"));

        StylistStatusEntity status = stylistStatusRepository.findById(dto.getStylistStatusId())
                .orElseThrow(() -> new RuntimeException("Stylist Status not found"));

        entity.setStylistRole(role);
        entity.setStylistStatus(status);
        entity.setExperienceYears(dto.getExperienceYears());
        entity.setBio(dto.getBio());

        StylistProfileEntity updatedEntity = stylistProfileRepository.save(entity);
        return convertToDTO(updatedEntity);
    }

}

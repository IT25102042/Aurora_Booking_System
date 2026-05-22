package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.StylistRoleDTO;
import com.saloon.aurora.entity.StylistRoleEntity;
import com.saloon.aurora.repository.StylistRoleRepository;
import com.saloon.aurora.service.StylistRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StylistRoleServiceImpl implements StylistRoleService {

    @Autowired
    private StylistRoleRepository stylistRoleRepository;

    @Override
    public StylistRoleDTO createStylistRole(StylistRoleDTO dto) {
        StylistRoleEntity entity = new StylistRoleEntity();
        entity.setStylistRole(dto.getStylistRole());
        StylistRoleEntity savedEntity = stylistRoleRepository.save(entity);
        
        StylistRoleDTO savedDto = new StylistRoleDTO();
        savedDto.setId(savedEntity.getId());
        savedDto.setStylistRole(savedEntity.getStylistRole());
        return savedDto;
    }

    @Override
    public List<StylistRoleDTO> getAllStylistRoles() {
        return stylistRoleRepository.findAll().stream().map(entity -> {
            StylistRoleDTO dto = new StylistRoleDTO();
            dto.setId(entity.getId());
            dto.setStylistRole(entity.getStylistRole());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void deleteStylistRole(Integer id) {
        if (!stylistRoleRepository.existsById(id)) {
            throw new RuntimeException("Stylist Role not found");
        }
        stylistRoleRepository.deleteById(id);
    }
}

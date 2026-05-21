package com.saloon.aurora.service;

import com.saloon.aurora.dto.StylistRoleDTO;

import java.util.List;

public interface StylistRoleService {
    StylistRoleDTO createStylistRole(StylistRoleDTO dto);
    List<StylistRoleDTO> getAllStylistRoles();
    void deleteStylistRole(Integer id);
}

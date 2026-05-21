package com.saloon.aurora.controller;

import com.saloon.aurora.dto.StylistRoleDTO;
import com.saloon.aurora.service.StylistRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stylist-roles")
@CrossOrigin(origins = "*")
public class StylistRoleController {

    @Autowired
    private StylistRoleService stylistRoleService;

    @PostMapping
    public StylistRoleDTO createStylistRole(@RequestBody StylistRoleDTO dto) {
        return stylistRoleService.createStylistRole(dto);
    }

    @GetMapping
    public List<StylistRoleDTO> getAllStylistRoles() {
        return stylistRoleService.getAllStylistRoles();
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteStylistRole(@PathVariable Integer id) {
        stylistRoleService.deleteStylistRole(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}

package com.saloon.aurora.controller;

import com.saloon.aurora.dto.StylistProfileDTO;
import com.saloon.aurora.service.impl.StylistProfileServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stylist-profiles")
@CrossOrigin(origins = "*")

public class StylistProfileController {

    @Autowired
    private StylistProfileServiceImpl stylistProfileService;

    @GetMapping
    public List<StylistProfileDTO> getAllStylistProfiles(){
        return stylistProfileService.getAllStylistProfiles();
    }

    @GetMapping("/search")
    public List<StylistProfileDTO> searchStylists(@RequestParam String keyword) {
        return stylistProfileService.searchStylists(keyword);
    }

    @PostMapping
    public StylistProfileDTO createStylistProfile(@RequestBody StylistProfileDTO dto) {
        return stylistProfileService.createStylistProfile(dto);
    }

    @PutMapping("/{id}")
    public StylistProfileDTO updateStylistProfile(@PathVariable Integer id, @RequestBody StylistProfileDTO dto) {
        return stylistProfileService.updateStylistProfile(id, dto);
    }



    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteStylistProfile(@PathVariable Integer id) {
        stylistProfileService.deleteStylistProfile(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}


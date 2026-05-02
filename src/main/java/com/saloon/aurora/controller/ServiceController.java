package com.saloon.aurora.controller;

import com.saloon.aurora.dto.ServiceDto;
import com.saloon.aurora.service.ServiceService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping("/api/service")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping("/all")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        List<ServiceDto> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addService(
            @Valid @RequestPart("service") ServiceDto serviceDto,
            BindingResult bindingResult,
            @RequestPart(value = "image1", required = false) MultipartFile image1,
            @RequestPart(value = "image2", required = false) MultipartFile image2,
            @RequestPart(value = "image3", required = false) MultipartFile image3
    ) {
        // 1. Validate ServiceDto
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors().stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errors);
        }

        // 2. Validate Image1 (Required)
        if (image1 == null || image1.isEmpty()) {
            return ResponseEntity.badRequest().body("First product image is required");
        }

        try {
            serviceService.addService(serviceDto, image1, image2, image3);
            return ResponseEntity.ok("Service added successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to add service: " + e.getMessage());
        }
    }
}

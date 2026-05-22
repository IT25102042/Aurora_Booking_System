package com.saloon.aurora.controller;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.dto.GenderDto;
import com.saloon.aurora.dto.ServiceStatusDto;
import com.saloon.aurora.service.ServiceAttributesService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/service-attributes")
@RequiredArgsConstructor
public class ServiceAttributesController {

    private final ServiceAttributesService serviceAttributesService;

    @GetMapping("/all-categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = serviceAttributesService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/all-genders")
    public ResponseEntity<List<GenderDto>> getAllGenders() {
        List<GenderDto> genders = serviceAttributesService.getAllGenders();
        return ResponseEntity.ok(genders);
    }

    @GetMapping("/all-service-statuses")
    public ResponseEntity<List<ServiceStatusDto>> getAllServiceStatuses() {
        List<ServiceStatusDto> statuses = serviceAttributesService.getAllServiceStatuses();
        return ResponseEntity.ok(statuses);
    }

    @PostMapping("/register-category")
    public ResponseEntity<String> registerCategory(@Valid @RequestBody CategoryDto categoryDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            serviceAttributesService.registerCategory(categoryDto);
            return ResponseEntity.ok("Category saved successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update-category")
    public ResponseEntity<String> updateCategory(@Valid @RequestBody CategoryDto categoryDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            serviceAttributesService.updateCategory(categoryDto);
            return ResponseEntity.ok("Category updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete-category/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Integer id) {
        try {
            serviceAttributesService.deleteCategory(id);
            return ResponseEntity.ok("Category deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}

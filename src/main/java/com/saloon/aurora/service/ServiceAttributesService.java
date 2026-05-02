package com.saloon.aurora.service;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.dto.GenderDto;
import com.saloon.aurora.dto.ServiceStatusDto;

import java.util.List;

public interface ServiceAttributesService {

    void registerCategory(CategoryDto categoryDto);
    void updateCategory(CategoryDto categoryDto);
    void deleteCategory(Integer id);

    List<CategoryDto> getAllCategories();
    List<GenderDto> getAllGenders();
    List<ServiceStatusDto> getAllServiceStatuses();
}

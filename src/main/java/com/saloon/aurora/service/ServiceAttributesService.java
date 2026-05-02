package com.saloon.aurora.service;

import com.saloon.aurora.dto.CategoryDto;

import java.util.List;

public interface ServiceAttributesService {

    void registerCategory(CategoryDto categoryDto);
    void updateCategory(CategoryDto categoryDto);
    void deleteCategory(Integer id);

    List<CategoryDto> getAllCategories();
}

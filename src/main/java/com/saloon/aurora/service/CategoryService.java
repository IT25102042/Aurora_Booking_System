package com.saloon.aurora.service;

import com.saloon.aurora.dto.CategoryDto;

import java.util.List;

public interface CategoryService {

    void registerCategory(CategoryDto categoryDto);

    List<CategoryDto> getAllCategories();
}

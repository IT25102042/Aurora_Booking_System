package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.entity.CategoryEntity;
import com.saloon.aurora.repository.CategoryRepository;
import com.saloon.aurora.service.ServiceAttributesService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceAttributesServiceImpl implements ServiceAttributesService {

    final CategoryRepository categoryRepository;
    final ModelMapper modelMapper;

    @Override
    public List<CategoryDto> getAllCategories() {
        List<CategoryDto> categoryDtoList = new ArrayList<>();

        categoryRepository.findAll().forEach(CategoryEntity ->{
            categoryDtoList.add(modelMapper.map(CategoryEntity, CategoryDto.class));
        });

        return categoryDtoList;
    }

    @Override
    public void registerCategory(CategoryDto categoryDto) {
        if (categoryRepository.findByCategory(categoryDto.getCategory()) != null) {
            throw new RuntimeException("Category already exists");
        }

        CategoryEntity categoryEntity = modelMapper.map(categoryDto, CategoryEntity.class);
        categoryRepository.save(categoryEntity);
    }

    @Override
    public void updateCategory(CategoryDto categoryDto) {
        CategoryEntity existingCategory = categoryRepository.findById(categoryDto.getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        CategoryEntity categoryWithName = categoryRepository.findByCategory(categoryDto.getCategory());
        if (categoryWithName != null && !categoryWithName.getId().equals(categoryDto.getId())) {
            throw new RuntimeException("Category name already exists");
        }

        existingCategory.setCategory(categoryDto.getCategory());
        categoryRepository.save(existingCategory);
    }

    @Override
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }
}

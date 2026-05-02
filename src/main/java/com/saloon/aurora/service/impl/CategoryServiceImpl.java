package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.entity.CategoryEntity;
import com.saloon.aurora.repository.CategoryRepository;
import com.saloon.aurora.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

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
}

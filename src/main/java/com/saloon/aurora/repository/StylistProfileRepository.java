package com.saloon.aurora.repository;

import com.saloon.aurora.entity.StylistProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StylistProfileRepository extends JpaRepository<StylistProfileEntity, Integer> {
    List<StylistProfileEntity> findByUser_EmailContainingIgnoreCaseOrUser_MobileContaining(
            String email,
            String mobile
    );
}
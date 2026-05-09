package com.saloon.aurora.repository;

import com.saloon.aurora.entity.StylistProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StylistProfileRepository
        extends JpaRepository<StylistProfileEntity, Integer> {
}
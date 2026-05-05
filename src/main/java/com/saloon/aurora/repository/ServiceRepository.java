package com.saloon.aurora.repository;

import com.saloon.aurora.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Integer> {
    boolean existsByTitleIgnoreCase(String title);
}

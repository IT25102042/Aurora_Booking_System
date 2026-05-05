package com.saloon.aurora.repository;

import com.saloon.aurora.entity.ServiceStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceStatusRepository extends JpaRepository<ServiceStatusEntity, Integer> {
}

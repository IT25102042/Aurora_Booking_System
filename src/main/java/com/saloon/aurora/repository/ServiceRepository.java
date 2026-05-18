package com.saloon.aurora.repository;

import com.saloon.aurora.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Integer>, JpaSpecificationExecutor<ServiceEntity> {
    boolean existsByTitleIgnoreCase(String title);
    java.util.Optional<ServiceEntity> findByTitleIgnoreCase(String title);

    // Find all services by status name (e.g., "Available")
    List<ServiceEntity> findByServiceStatus_ServiceStatusIgnoreCase(String statusName);
}

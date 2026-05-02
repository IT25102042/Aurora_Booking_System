package com.saloon.aurora.repository;

import com.saloon.aurora.entity.PaymentMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Integer> {

    Optional<PaymentMethodEntity> findByPaymentMethod(String paymentMethod);

    List<PaymentMethodEntity> findByPaymentMethodContainingIgnoreCase(String keyword);
}
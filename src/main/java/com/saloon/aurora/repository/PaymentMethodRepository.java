package com.saloon.aurora.repository;

import com.saloon.aurora.entity.PaymentMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Integer> {

    Optional<PaymentMethodEntity> findByPaymentMethod(String paymentMethod);

}
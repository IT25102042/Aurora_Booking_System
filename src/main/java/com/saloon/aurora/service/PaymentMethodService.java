package com.saloon.aurora.service;

import com.saloon.aurora.dto.PaymentMethodDTO;
import com.saloon.aurora.entity.PaymentMethodEntity;
import com.saloon.aurora.repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    public PaymentMethodDTO createPaymentMethod(PaymentMethodDTO dto) {

        PaymentMethodEntity entity = new PaymentMethodEntity();

        entity.setPaymentMethod(dto.getPaymentMethod());

        PaymentMethodEntity savedEntity =
                paymentMethodRepository.save(entity);

        return mapToDTO(savedEntity);
    }

    public List<PaymentMethodDTO> getAllPaymentMethods() {

        return paymentMethodRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PaymentMethodDTO getPaymentMethodById(Integer id) {

        PaymentMethodEntity entity =
                paymentMethodRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Payment method not found"));

        return mapToDTO(entity);
    }

    public PaymentMethodDTO updatePaymentMethod(Integer id,
                                                PaymentMethodDTO dto) {

        PaymentMethodEntity entity =
                paymentMethodRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Payment method not found"));

        entity.setPaymentMethod(dto.getPaymentMethod());

        PaymentMethodEntity updatedEntity =
                paymentMethodRepository.save(entity);

        return mapToDTO(updatedEntity);
    }

    public void deletePaymentMethod(Integer id) {

        PaymentMethodEntity entity =
                paymentMethodRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Payment method not found"));

        paymentMethodRepository.delete(entity);
    }

    private PaymentMethodDTO mapToDTO(PaymentMethodEntity entity) {

        PaymentMethodDTO dto = new PaymentMethodDTO();

        dto.setId(entity.getId());
        dto.setPaymentMethod(entity.getPaymentMethod());

        return dto;
    }
}
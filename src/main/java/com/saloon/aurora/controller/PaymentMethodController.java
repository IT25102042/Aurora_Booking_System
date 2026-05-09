package com.saloon.aurora.controller;

import com.saloon.aurora.dto.PaymentMethodDTO;
import com.saloon.aurora.service.PaymentMethodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
@CrossOrigin
public class PaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;

    @PostMapping
    public PaymentMethodDTO createPaymentMethod(
            @RequestBody PaymentMethodDTO dto) {

        return paymentMethodService.createPaymentMethod(dto);
    }

    @GetMapping
    public List<PaymentMethodDTO> getAllPaymentMethods() {

        return paymentMethodService.getAllPaymentMethods();
    }

    @GetMapping("/{id}")
    public PaymentMethodDTO getPaymentMethodById(
            @PathVariable Integer id) {

        return paymentMethodService.getPaymentMethodById(id);
    }

    @PutMapping("/{id}")
    public PaymentMethodDTO updatePaymentMethod(
            @PathVariable Integer id,
            @RequestBody PaymentMethodDTO dto) {

        return paymentMethodService.updatePaymentMethod(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deletePaymentMethod(@PathVariable Integer id) {

        paymentMethodService.deletePaymentMethod(id);

        return "Payment method deleted successfully";
    }
}
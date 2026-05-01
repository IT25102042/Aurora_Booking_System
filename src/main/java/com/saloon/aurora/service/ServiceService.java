package com.saloon.aurora.service;


import com.saloon.aurora.dto.ServiceDto;
import java.util.List;

public interface ServiceService {

    void registerService(ServiceDto serviceDto);
    
    List<ServiceDto> getAllServices();
}

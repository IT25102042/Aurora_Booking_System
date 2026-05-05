package com.saloon.aurora.service;


import com.saloon.aurora.dto.ServiceDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface ServiceService {
    
    List<ServiceDto> getAllServices();
    void addService(ServiceDto serviceDto, MultipartFile image1, MultipartFile image2, MultipartFile image3) throws IOException;
}

package com.saloon.aurora.service;

import com.saloon.aurora.dto.ServiceDto;

import java.util.List;

public interface WishlistService {
    List<ServiceDto> getWishlist(Integer userId);
    void addToWishlist(Integer userId, Integer serviceId);
    void removeFromWishlist(Integer userId, Integer serviceId);
    boolean isWished(Integer userId, Integer serviceId);
}

package com.saloon.aurora.service;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.dto.GenderDto;
import com.saloon.aurora.dto.ServiceDto;

import java.util.List;
import java.util.Map;

public interface ServiceDisplayService {

    /**
     * Get active services with filtering, searching, sorting, and pagination.
     *
     * @param searchQuery  - search by service title (optional)
     * @param categoryIds  - filter by category IDs (optional)
     * @param genderIds    - filter by gender IDs (optional)
     * @param maxPrice     - filter by max price (optional)
     * @param durations    - filter by duration values in minutes (optional)
     * @param sortBy       - sort option: "recommended", "priceLowHigh", "priceHighLow", "durationShortLong" (optional)
     * @param page         - page number (0-indexed)
     * @param size         - items per page
     * @return paginated result map containing services, totalElements, totalPages, currentPage
     */
    Map<String, Object> getActiveServices(
            String searchQuery,
            List<Integer> categoryIds,
            List<Integer> genderIds,
            Double maxPrice,
            List<Integer> durations,
            String sortBy,
            int page,
            int size
    );

    /**
     * Get all categories for the filter sidebar
     */
    List<CategoryDto> getFilterCategories();

    /**
     * Get all genders for the filter sidebar
     */
    List<GenderDto> getFilterGenders();

    /**
     * Get the distinct durations available across active services
     */
    List<Integer> getAvailableDurations();

    /**
     * Get the max price among all active services
     */
    Double getMaxPrice();

    /**
     * Get a single service by ID if it is active
     */
    ServiceDto getServiceById(Integer id);

    /**
     * Get related services (e.g., in the same category)
     */
    List<ServiceDto> getRelatedServices(Integer id, int limit);
}

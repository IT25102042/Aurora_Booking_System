package com.saloon.aurora.controller;

import com.saloon.aurora.dto.CategoryDto;
import com.saloon.aurora.dto.GenderDto;
import com.saloon.aurora.service.ServiceDisplayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/service-display")
@RequiredArgsConstructor
public class ServiceDisplayController {

    private final ServiceDisplayService serviceDisplayService;

    /**
     * GET /api/service-display/active
     * Returns paginated active services with optional filtering, searching, and sorting.
     *
     * Query params:
     *   search       - search by service title
     *   categoryIds  - comma-separated category IDs (e.g., 1,2,3)
     *   genderIds    - comma-separated gender IDs (e.g., 1,2)
     *   maxPrice     - max price filter
     *   durations    - comma-separated duration values in minutes (e.g., 30,60,90)
     *   sortBy       - recommended | priceLowHigh | priceHighLow | durationShortLong
     *   page         - page number (0-indexed, default 0)
     *   size         - items per page (default 6)
     */
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveServices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<Integer> categoryIds,
            @RequestParam(required = false) List<Integer> genderIds,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) List<Integer> durations,
            @RequestParam(defaultValue = "recommended") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        Map<String, Object> result = serviceDisplayService.getActiveServices(
                search, categoryIds, genderIds, maxPrice, durations, sortBy, page, size
        );
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/service-display/filters
     * Returns all filter options: categories, genders, available durations, and max price.
     */
    @GetMapping("/filters")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        List<CategoryDto> categories = serviceDisplayService.getFilterCategories();
        List<GenderDto> genders = serviceDisplayService.getFilterGenders();
        List<Integer> durations = serviceDisplayService.getAvailableDurations();
        Double maxPrice = serviceDisplayService.getMaxPrice();

        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("categories", categories);
        filters.put("genders", genders);
        filters.put("durations", durations);
        filters.put("maxPrice", maxPrice);

        return ResponseEntity.ok(filters);
    }

    /**
     * GET /api/service-display/service/{id}
     * Returns a single active service by ID.
     */
    @GetMapping("/service/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(serviceDisplayService.getServiceById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/service-display/related/{id}
     * Returns related services for a given service ID.
     */
    @GetMapping("/related/{id}")
    public ResponseEntity<List<?>> getRelatedServices(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        return ResponseEntity.ok(serviceDisplayService.getRelatedServices(id, limit));
    }
}

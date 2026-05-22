package com.saloon.aurora.controller;

import com.saloon.aurora.dto.ServiceDto;
import com.saloon.aurora.dto.UserDto;
import com.saloon.aurora.service.WishlistService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<?> getWishlist(HttpSession session) {
        UserDto currentUser = (UserDto) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("status", false, "message", "Not logged in"));
        }
        try {
            List<ServiceDto> wishlist = wishlistService.getWishlist(currentUser.getId());
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PostMapping("/add/{serviceId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Integer serviceId, HttpSession session) {
        UserDto currentUser = (UserDto) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("status", false, "message", "Not logged in"));
        }
        try {
            wishlistService.addToWishlist(currentUser.getId(), serviceId);
            return ResponseEntity.ok(Map.of("status", true, "message", "Service added to wishlist"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @DeleteMapping("/remove/{serviceId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Integer serviceId, HttpSession session) {
        UserDto currentUser = (UserDto) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("status", false, "message", "Not logged in"));
        }
        try {
            wishlistService.removeFromWishlist(currentUser.getId(), serviceId);
            return ResponseEntity.ok(Map.of("status", true, "message", "Service removed from wishlist"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @GetMapping("/check/{serviceId}")
    public ResponseEntity<?> checkWishlistStatus(@PathVariable Integer serviceId, HttpSession session) {
        UserDto currentUser = (UserDto) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.ok(Map.of("status", false, "isWished", false));
        }
        try {
            boolean isWished = wishlistService.isWished(currentUser.getId(), serviceId);
            return ResponseEntity.ok(Map.of("status", true, "isWished", isWished));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

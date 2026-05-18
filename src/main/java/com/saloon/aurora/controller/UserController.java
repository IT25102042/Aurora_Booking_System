package com.saloon.aurora.controller;

import com.saloon.aurora.dto.*;
import com.saloon.aurora.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        UserDto user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<String> saveUser(@RequestBody UserDto userDto) {
        String response = userService.saveUser(userDto);
        if (response.equals("User saved successfully!")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody UserDto userDto) {
        String response = userService.updateUser(userDto);
        if (response.equals("User updated successfully!")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody UserDto userDto) {
        String response = userService.signUp(userDto);
        if (response.equals("Registration successful!")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInDto signInDto, HttpServletRequest request) {
        try {
            UserDto user = userService.signIn(signInDto);
            if (user != null) {
                HttpSession session = request.getSession();
                session.setAttribute("user", user);
                return ResponseEntity.ok(Map.of("status", true, "message", "Login successful"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", false, "message", "Invalid credentials!"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            UserDto user = (UserDto) session.getAttribute("user");
            return ResponseEntity.ok(Map.of("status", true, "user", user));
        } else {
            return ResponseEntity.ok(Map.of("status", false, "message", "User not logged in"));
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signOut(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("status", true));
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("mobile") String mobile,
            @RequestParam(value = "image", required = false) MultipartFile image,
            HttpSession session
    ) {
        UserDto currentUser = (UserDto) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("status", false, "message", "Not logged in"));
        }

        try {
            UserDto userDto = new UserDto();
            userDto.setId(currentUser.getId());
            userDto.setFirstName(firstName);
            userDto.setLastName(lastName);
            userDto.setEmail(email);
            userDto.setMobile(mobile);

            userService.updateProfile(userDto, image);

            // Update session with new details
            currentUser.setFirstName(firstName);
            currentUser.setLastName(lastName);
            currentUser.setEmail(email);
            currentUser.setMobile(mobile);
            session.setAttribute("user", currentUser);

            return ResponseEntity.ok(Map.of("status", true, "message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordUpdateDto passwordUpdateDto, HttpSession session) {
        UserDto currentUser = (UserDto) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("status", false, "message", "Not logged in"));
        }

        try {
            userService.updatePassword(currentUser.getId(), passwordUpdateDto);
            return ResponseEntity.ok(Map.of("status", true, "message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/genders")
    public ResponseEntity<List<GenderDto>> getAllGenders() {
        return ResponseEntity.ok(userService.getAllGenders());
    }

    @GetMapping("/types")
    public ResponseEntity<List<UserTypeDto>> getAllUserTypes() {
        return ResponseEntity.ok(userService.getAllUserTypes());
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<UserStatusDto>> getAllUserStatuses() {
        return ResponseEntity.ok(userService.getAllUserStatuses());
    }
}

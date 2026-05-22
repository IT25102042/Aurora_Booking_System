package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.*;
import com.saloon.aurora.entity.GenderEntity;
import com.saloon.aurora.entity.UserEntity;
import com.saloon.aurora.entity.UserStatusEntity;
import com.saloon.aurora.entity.UserTypeEntity;
import com.saloon.aurora.repository.GenderRepository;
import com.saloon.aurora.repository.UserStatusRepository;
import com.saloon.aurora.repository.UserTypeRepository;
import com.saloon.aurora.repository.UserRepository;
import com.saloon.aurora.service.UserService;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GenderRepository genderRepository;

    @Autowired
    private UserTypeRepository userTypeRepository;

    @Autowired
    private UserStatusRepository userStatusRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<UserDto> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        List<UserDto> userDtos = modelMapper.map(users, new TypeToken<List<UserDto>>() {}.getType());
        
        for (int i = 0; i < users.size(); i++) {
            UserEntity user = users.get(i);
            UserDto dto = userDtos.get(i);
            dto.setGender(user.getGender().getGender());
            dto.setUserType(user.getUserType().getUserType());
            dto.setUserStatus(user.getUserStatus().getUserStatus());
            dto.setGenderId(user.getGender().getId());
            dto.setUserTypeId(user.getUserType().getId());
            dto.setUserStatusId(user.getUserStatus().getId());
        }
        
        return userDtos;
    }

    @Override
    public UserDto getUserById(Integer id) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) return null;
        
        UserDto dto = modelMapper.map(user, UserDto.class);
        dto.setGender(user.getGender().getGender());
        dto.setUserType(user.getUserType().getUserType());
        dto.setUserStatus(user.getUserStatus().getUserStatus());
        dto.setGenderId(user.getGender().getId());
        dto.setUserTypeId(user.getUserType().getId());
        dto.setUserStatusId(user.getUserStatus().getId());
        return dto;
    }

    @Override
    public String saveUser(UserDto userDto) {
        if (userRepository.findAll().stream().anyMatch(u -> u.getEmail().equals(userDto.getEmail()))) {
            return "Email already exists!";
        }

        UserEntity user = new UserEntity();
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setMobile(userDto.getMobile());
        user.setPassword(userDto.getPassword());
        user.setCreatedAt(new Date());

        GenderEntity gender = genderRepository.findById(userDto.getGenderId()).orElse(null);
        UserTypeEntity type = userTypeRepository.findById(userDto.getUserTypeId()).orElse(null);
        UserStatusEntity status = userStatusRepository.findById(userDto.getUserStatusId()).orElse(null);

        if (gender == null || type == null || status == null) {
            return "Invalid selection for Gender, Role, or Status.";
        }

        user.setGender(gender);
        user.setUserType(type);
        user.setUserStatus(status);

        userRepository.save(user);
        return "User saved successfully!";
    }

    @Override
    public String updateUser(UserDto userDto) {
        UserEntity user = userRepository.findById(userDto.getId()).orElse(null);
        if (user == null) {
            return "User not found!";
        }

        // Check if email changed and if new email already exists
        if (!user.getEmail().equals(userDto.getEmail())) {
            if (userRepository.findAll().stream().anyMatch(u -> u.getEmail().equals(userDto.getEmail()))) {
                return "New email already exists!";
            }
        }

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setMobile(userDto.getMobile());
        
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(userDto.getPassword());
        }

        GenderEntity gender = genderRepository.findById(userDto.getGenderId()).orElse(null);
        UserTypeEntity type = userTypeRepository.findById(userDto.getUserTypeId()).orElse(null);
        UserStatusEntity status = userStatusRepository.findById(userDto.getUserStatusId()).orElse(null);

        if (gender == null || type == null || status == null) {
            return "Invalid selection for Gender, Role, or Status.";
        }

        user.setGender(gender);
        user.setUserType(type);
        user.setUserStatus(status);

        userRepository.save(user);
        return "User updated successfully!";
    }

    @Override
    public String signUp(UserDto userDto) {
        // Validation
        if (userDto.getFirstName() == null || userDto.getFirstName().trim().isEmpty()) return "First name is required.";
        if (userDto.getLastName() == null || userDto.getLastName().trim().isEmpty()) return "Last name is required.";
        if (userDto.getEmail() == null || userDto.getEmail().trim().isEmpty()) return "Email is required.";
        if (userDto.getMobile() == null || userDto.getMobile().trim().isEmpty()) return "Mobile is required.";
        if (userDto.getPassword() == null || userDto.getPassword().trim().isEmpty()) return "Password is required.";
        if (userDto.getConfirmPassword() == null || userDto.getConfirmPassword().trim().isEmpty()) return "Please confirm your password.";
        if (userDto.getGenderId() == null) return "Gender is required.";

        if (!userDto.getPassword().equals(userDto.getConfirmPassword())) {
            return "Passwords do not match!";
        }

        if (userRepository.findAll().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(userDto.getEmail()))) {
            return "Email already exists!";
        }

        UserEntity user = new UserEntity();
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setMobile(userDto.getMobile());
        user.setPassword(userDto.getPassword()); // In a real app, use BCrypt!
        user.setCreatedAt(new Date());

        GenderEntity gender = genderRepository.findById(userDto.getGenderId()).orElse(null);
        if (gender == null) return "Invalid gender selection.";
        user.setGender(gender);

        // Set defaults: Active status and Customer type
        UserStatusEntity activeStatus = userStatusRepository.findAll().stream()
                .filter(s -> s.getUserStatus().equalsIgnoreCase("Active"))
                .findFirst().orElse(null);
        UserTypeEntity customerType = userTypeRepository.findAll().stream()
                .filter(t -> t.getUserType().equalsIgnoreCase("Customer"))
                .findFirst().orElse(null);

        if (activeStatus == null || customerType == null) {
            return "System error: Default User Status (Active) or User Type (Customer) not found in database.";
        }

        user.setUserStatus(activeStatus);
        user.setUserType(customerType);

        userRepository.save(user);
        return "Registration successful!";
    }

    @Override
    public UserDto signIn(SignInDto signInDto) {
        UserEntity user = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(signInDto.getEmail()) && u.getPassword().equals(signInDto.getPassword()))
                .findFirst().orElse(null);

        if (user != null) {
            if ("Inactive".equalsIgnoreCase(user.getUserStatus().getUserStatus()) || "Banned".equalsIgnoreCase(user.getUserStatus().getUserStatus())) {
                throw new RuntimeException("Inactive User!");
            }
            
            UserDto dto = modelMapper.map(user, UserDto.class);
            dto.setGender(user.getGender().getGender());
            dto.setUserType(user.getUserType().getUserType());
            dto.setUserStatus(user.getUserStatus().getUserStatus());
            dto.setGenderId(user.getGender().getId());
            dto.setUserTypeId(user.getUserType().getId());
            dto.setUserStatusId(user.getUserStatus().getId());
            return dto;
        }
        return null;
    }

    @Override
    public List<GenderDto> getAllGenders() {
        return genderRepository.findAll().stream()
                .map(g -> modelMapper.map(g, GenderDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserTypeDto> getAllUserTypes() {
        return userTypeRepository.findAll().stream()
                .map(t -> modelMapper.map(t, UserTypeDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserStatusDto> getAllUserStatuses() {
        return userStatusRepository.findAll().stream()
                .map(s -> modelMapper.map(s, UserStatusDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void updateProfile(UserDto userDto, MultipartFile image) throws IOException {
        UserEntity user = userRepository.findById(userDto.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setMobile(userDto.getMobile());

        userRepository.save(user);

        if (image != null && !image.isEmpty()) {
            String uploadDir = "src/main/resources/static/user_images/" + user.getId();
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }
            Path filePath = Paths.get(uploadDir, "image1.png");
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    @Override
    public void updatePassword(Integer userId, PasswordUpdateDto passwordUpdateDto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(passwordUpdateDto.getCurrentPassword())) {
            throw new RuntimeException("Current password is incorrect!");
        }

        if (!passwordUpdateDto.getNewPassword().equals(passwordUpdateDto.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match!");
        }

        user.setPassword(passwordUpdateDto.getNewPassword());
        userRepository.save(user);
    }
}

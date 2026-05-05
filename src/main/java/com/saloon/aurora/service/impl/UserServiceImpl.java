package com.saloon.aurora.service.impl;

import com.saloon.aurora.dto.UserDto;
import com.saloon.aurora.entity.*;
import com.saloon.aurora.repository.*;
import com.saloon.aurora.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

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

    @Override
    public UserDto registerUser(UserDto userDto) throws Exception {
        Optional<UserEntity> existingUser = userRepository.findByEmail(userDto.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("Email already exists");
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setFirstName(userDto.getFirstName());
        userEntity.setLastName(userDto.getLastName());
        userEntity.setMobile(userDto.getMobile());
        userEntity.setEmail(userDto.getEmail());
        userEntity.setPassword(userDto.getPassword()); // Plain text as requested
        userEntity.setCreatedAt(new Date());

        GenderEntity gender = genderRepository.findById(userDto.getGenderId())
                .orElseThrow(() -> new Exception("Invalid gender ID"));
        userEntity.setGender(gender);

        // Default to Customer (1) if not provided
        Integer typeId = userDto.getUserTypeId() != null ? userDto.getUserTypeId() : 1;
        UserTypeEntity userType = userTypeRepository.findById(typeId)
                .orElseThrow(() -> new Exception("Invalid user type ID"));
        userEntity.setUserType(userType);

        // Default to Active (1)
        UserStatusEntity userStatus = userStatusRepository.findById(1)
                .orElseThrow(() -> new Exception("Invalid user status ID"));
        userEntity.setUserStatus(userStatus);

        userEntity = userRepository.save(userEntity);
        userDto.setId(userEntity.getId());
        userDto.setUserTypeId(userType.getId());
        userDto.setUserStatusId(userStatus.getId());
        userDto.setPassword(null); // don't return password

        return userDto;
    }

    @Override
    public UserDto loginUser(String email, String password) throws Exception {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Invalid email or password"));

        if (!userEntity.getPassword().equals(password)) {
            throw new Exception("Invalid email or password");
        }

        if (userEntity.getUserStatus().getId() != 1) { // 1 is Active
            throw new Exception("User account is inactive");
        }

        UserDto userDto = new UserDto();
        userDto.setId(userEntity.getId());
        userDto.setFirstName(userEntity.getFirstName());
        userDto.setLastName(userEntity.getLastName());
        userDto.setMobile(userEntity.getMobile());
        userDto.setEmail(userEntity.getEmail());
        userDto.setGenderId(userEntity.getGender().getId());
        userDto.setUserTypeId(userEntity.getUserType().getId());
        userDto.setUserStatusId(userEntity.getUserStatus().getId());
        
        return userDto;
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserDto dto = new UserDto();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setMobile(user.getMobile());
            dto.setGenderId(user.getGender().getId());
            dto.setUserTypeId(user.getUserType().getId());
            dto.setUserStatusId(user.getUserStatus().getId());
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public UserDto updateUser(Integer id, UserDto userDto) throws Exception {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setMobile(userDto.getMobile());
        user.setEmail(userDto.getEmail());
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(userDto.getPassword());
        }

        GenderEntity gender = genderRepository.findById(userDto.getGenderId())
                .orElseThrow(() -> new Exception("Invalid gender ID"));
        user.setGender(gender);

        UserTypeEntity userType = userTypeRepository.findById(userDto.getUserTypeId())
                .orElseThrow(() -> new Exception("Invalid user type ID"));
        user.setUserType(userType);

        UserStatusEntity userStatus = userStatusRepository.findById(userDto.getUserStatusId())
                .orElseThrow(() -> new Exception("Invalid user status ID"));
        user.setUserStatus(userStatus);

        userRepository.save(user);
        return userDto;
    }

    @Override
    public void deleteUser(Integer id) throws Exception {
        if (!userRepository.existsById(id)) {
            throw new Exception("User not found");
        }
        userRepository.deleteById(id);
    }
}

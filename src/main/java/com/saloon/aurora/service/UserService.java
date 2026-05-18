package com.saloon.aurora.service;

import com.saloon.aurora.dto.GenderDto;
import com.saloon.aurora.dto.UserDto;
import com.saloon.aurora.dto.UserStatusDto;
import com.saloon.aurora.dto.UserTypeDto;
import com.saloon.aurora.dto.SignInDto;
import com.saloon.aurora.dto.PasswordUpdateDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Integer id);
    String saveUser(UserDto userDto);
    String updateUser(UserDto userDto);
    String signUp(UserDto userDto);
    UserDto signIn(SignInDto signInDto);
    void updateProfile(UserDto userDto, MultipartFile image) throws IOException;
    void updatePassword(Integer userId, PasswordUpdateDto passwordUpdateDto);
    List<GenderDto> getAllGenders();
    List<UserTypeDto> getAllUserTypes();
    List<UserStatusDto> getAllUserStatuses();
}

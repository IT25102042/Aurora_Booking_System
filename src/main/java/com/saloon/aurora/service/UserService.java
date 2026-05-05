package com.saloon.aurora.service;

import com.saloon.aurora.dto.UserDto;
import java.util.List;

public interface UserService {
    UserDto registerUser(UserDto userDto) throws Exception;
    UserDto loginUser(String email, String password) throws Exception;
    List<UserDto> getAllUsers();
    UserDto updateUser(Integer id, UserDto userDto) throws Exception;
    void deleteUser(Integer id) throws Exception;
}

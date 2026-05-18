package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Integer id;
    private String firstName;
    private String lastName;
    private String mobile;
    private String email;
    private String password;
    private String confirmPassword;
    private String gender;
    private String userType;
    private String userStatus;
    private Integer genderId;
    private Integer userTypeId;
    private Integer userStatusId;
    private Date createdAt;
}

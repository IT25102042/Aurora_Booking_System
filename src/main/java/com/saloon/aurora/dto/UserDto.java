package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer genderId;
    private Integer userTypeId;
    private Integer userStatusId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginDto {
        private String email;
        private String password;
    }
}

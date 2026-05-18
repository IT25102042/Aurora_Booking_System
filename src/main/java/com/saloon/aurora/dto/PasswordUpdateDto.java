package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordUpdateDto {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}

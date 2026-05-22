package com.saloon.aurora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor



public class StylistProfileDTO {

    private Integer id;

    private Integer userId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;

    private Integer stylistRoleId;
    private String stylistRoleName;

    private Integer stylistStatusId;
    private String stylistStatusName;

    private Integer experienceYears;
    private String bio;
}

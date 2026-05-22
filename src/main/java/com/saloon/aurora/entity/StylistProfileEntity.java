package com.saloon.aurora.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stylist_profiles")
public class StylistProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "users_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "stylist_role_id", nullable = false)
    private StylistRoleEntity stylistRole;

    @ManyToOne
    @JoinColumn(name = "stylist_status_id", nullable = false)
    private StylistStatusEntity stylistStatus;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @ManyToMany(mappedBy = "stylistProfiles")
    private Set<ServiceEntity> services = new HashSet<>();
}

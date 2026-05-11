package com.saloon.aurora.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false, length = 45)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 45)
    private String lastName;

    @Column(name = "mobile", nullable = false, length = 10)
    private String mobile;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "verification", length = 20)
    private String verification;

    @Column(name = "reset_code", length = 45)
    private String resetCode;

    @ManyToOne
    @JoinColumn(name = "gender_id", nullable = false)
    private GenderEntity gender;

    @ManyToOne
    @JoinColumn(name = "user_type_id", nullable = false)
    private UserTypeEntity userType;

    @ManyToOne
    @JoinColumn(name = "user_status_id", nullable = false)
    private UserStatusEntity userStatus;

    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @ManyToMany
    @JoinTable(
            name = "wishlist",
            joinColumns = @JoinColumn(name = "users_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<ServiceEntity> wishlistServices = new HashSet<>();

}

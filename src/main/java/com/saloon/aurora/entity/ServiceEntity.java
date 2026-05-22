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
@Table(name = "service")
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @ManyToOne
    @JoinColumn(name = "gender_id", nullable = false)
    private GenderEntity gender;

    @ManyToOne
    @JoinColumn(name = "service_status_id", nullable = false)
    private ServiceStatusEntity serviceStatus;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @ManyToMany
    @JoinTable(
            name = "service_stylists",
            joinColumns = @JoinColumn(name = "service_id"),
            inverseJoinColumns = @JoinColumn(name = "stylist_profile_id")
    )
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private Set<StylistProfileEntity> stylistProfiles = new HashSet<>();

    @ManyToMany(mappedBy = "wishlistServices")
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private Set<UserEntity> wishedUsers = new HashSet<>();
}

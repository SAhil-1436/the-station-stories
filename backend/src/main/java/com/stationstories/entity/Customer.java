package com.stationstories.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(length = 100)
    private String name;

    @Column(length = 120)
    private String email;

    @Column(name = "visit_count", nullable = false)
    private int visitCount = 1;

    @Column(name = "total_spent", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "last_visit_at", nullable = false)
    private Instant lastVisitAt = Instant.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Customer() {}

    public Customer(String phone, String name, String email) {
        this.phone = phone;
        this.name = name;
        this.email = email;
        this.visitCount = 1;
        this.totalSpent = BigDecimal.ZERO;
        this.lastVisitAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        if (lastVisitAt == null) lastVisitAt = Instant.now();
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public void recordVisit(BigDecimal purchaseAmount) {
        this.visitCount++;
        if (purchaseAmount != null) {
            this.totalSpent = this.totalSpent.add(purchaseAmount);
        }
        this.lastVisitAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public Instant getLastVisitAt() {
        return lastVisitAt;
    }

    public void setLastVisitAt(Instant lastVisitAt) {
        this.lastVisitAt = lastVisitAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

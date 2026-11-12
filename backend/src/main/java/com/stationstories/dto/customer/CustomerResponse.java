package com.stationstories.dto.customer;

import java.math.BigDecimal;
import java.time.Instant;

public class CustomerResponse {
    private Long id;
    private String phone;
    private String name;
    private String email;
    private int visitCount;
    private BigDecimal totalSpent;
    private Instant lastVisitAt;
    private Instant createdAt;

    public CustomerResponse() {}

    public CustomerResponse(Long id, String phone, String name, String email, int visitCount,
                            BigDecimal totalSpent, Instant lastVisitAt, Instant createdAt) {
        this.id = id;
        this.phone = phone;
        this.name = name;
        this.email = email;
        this.visitCount = visitCount;
        this.totalSpent = totalSpent;
        this.lastVisitAt = lastVisitAt;
        this.createdAt = createdAt;
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
}

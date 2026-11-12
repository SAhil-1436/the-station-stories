package com.stationstories.dto.auth;

import java.util.List;

public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private String companyCardNumber;
    private List<String> roles;
    private boolean active;

    public UserDto() {}

    public UserDto(Long id, String username, String fullName, String phone, String companyCardNumber, List<String> roles, boolean active) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.phone = phone;
        this.companyCardNumber = companyCardNumber;
        this.roles = roles;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompanyCardNumber() {
        return companyCardNumber;
    }

    public void setCompanyCardNumber(String companyCardNumber) {
        this.companyCardNumber = companyCardNumber;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

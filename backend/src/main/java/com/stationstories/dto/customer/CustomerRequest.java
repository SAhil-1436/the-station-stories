package com.stationstories.dto.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CustomerRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+91|0)?[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number")
    private String phone;

    private String name;

    private String email;

    public CustomerRequest() {}

    public CustomerRequest(String phone, String name, String email) {
        this.phone = phone;
        this.name = name;
        this.email = email;
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
}

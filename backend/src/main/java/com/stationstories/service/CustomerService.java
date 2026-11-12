package com.stationstories.service;

import com.stationstories.dto.customer.CustomerRequest;
import com.stationstories.dto.customer.CustomerResponse;
import com.stationstories.entity.Customer;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public static String normalizePhoneNumber(String rawPhone) {
        if (rawPhone == null || rawPhone.trim().isEmpty()) {
            return null;
        }
        String digitsOnly = rawPhone.replaceAll("\\D", "");
        if (digitsOnly.startsWith("91") && digitsOnly.length() == 12) {
            digitsOnly = digitsOnly.substring(2);
        } else if (digitsOnly.startsWith("0") && digitsOnly.length() == 11) {
            digitsOnly = digitsOnly.substring(1);
        }
        if (digitsOnly.length() != 10 || !digitsOnly.matches("^[6-9]\\d{9}$")) {
            throw new BusinessException("Phone number '" + rawPhone + "' is invalid. Must be a valid 10-digit Indian mobile number.");
        }
        return digitsOnly;
    }

    @Transactional(readOnly = true)
    public CustomerResponse lookupByPhone(String phone) {
        String normalized = normalizePhoneNumber(phone);
        if (normalized == null) {
            throw new BusinessException("Phone parameter cannot be empty");
        }
        Customer customer = customerRepository.findByPhone(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with phone: " + phone));
        return mapToResponse(customer);
    }

    @Transactional(readOnly = true)
    public Optional<Customer> findCustomerByNormalizedPhone(String normalizedPhone) {
        if (normalizedPhone == null) return Optional.empty();
        return customerRepository.findByPhone(normalizedPhone);
    }

    @Transactional
    public Customer findOrCreateCustomer(String rawPhone, String rawName) {
        String normalized = normalizePhoneNumber(rawPhone);
        if (normalized == null) {
            return null;
        }

        return customerRepository.findByPhone(normalized)
                .map(existing -> {
                    if (rawName != null && !rawName.trim().isEmpty() &&
                            (existing.getName() == null || existing.getName().equals("Walk-in Customer"))) {
                        existing.setName(rawName.trim());
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    String initialName = (rawName != null && !rawName.trim().isEmpty()) ? rawName.trim() : "Valued Customer";
                    Customer newCustomer = new Customer(normalized, initialName, null);
                    return customerRepository.save(newCustomer);
                });
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        String normalized = normalizePhoneNumber(request.getPhone());
        if (customerRepository.existsByPhone(normalized)) {
            throw new BusinessException("Customer profile already exists for phone: " + request.getPhone());
        }

        Customer customer = new Customer();
        customer.setPhone(normalized);
        customer.setName(request.getName() != null ? request.getName().trim() : "Valued Customer");
        customer.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        String normalized = normalizePhoneNumber(request.getPhone());
        if (!customer.getPhone().equals(normalized)) {
            if (customerRepository.existsByPhone(normalized)) {
                throw new BusinessException("Another customer already exists with phone: " + request.getPhone());
            }
            customer.setPhone(normalized);
        }

        if (request.getName() != null) {
            customer.setName(request.getName().trim());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail().trim());
        }

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    public CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getPhone(),
                customer.getName(),
                customer.getEmail(),
                customer.getVisitCount(),
                customer.getTotalSpent(),
                customer.getLastVisitAt(),
                customer.getCreatedAt()
        );
    }
}

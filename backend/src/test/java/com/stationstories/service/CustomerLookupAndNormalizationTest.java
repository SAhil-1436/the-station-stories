package com.stationstories.service;

import com.stationstories.dto.customer.CustomerRequest;
import com.stationstories.dto.customer.CustomerResponse;
import com.stationstories.entity.Customer;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.CustomerRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerLookupAndNormalizationTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    @DisplayName("Should normalize various phone number formats to standard 10 digits")
    void testPhoneNormalization() {
        assertThat(CustomerService.normalizePhoneNumber("9876543210")).isEqualTo("9876543210");
        assertThat(CustomerService.normalizePhoneNumber("+919876543210")).isEqualTo("9876543210");
        assertThat(CustomerService.normalizePhoneNumber("+91 98765 43210")).isEqualTo("9876543210");
        assertThat(CustomerService.normalizePhoneNumber("09876543210")).isEqualTo("9876543210");
        assertThat(CustomerService.normalizePhoneNumber("98765-43210")).isEqualTo("9876543210");
    }

    @Test
    @DisplayName("Should return null for empty or null phone numbers to support anonymous walk-in purchases")
    void testAnonymousCustomerPhoneHandling() {
        assertThat(CustomerService.normalizePhoneNumber(null)).isNull();
        assertThat(CustomerService.normalizePhoneNumber("")).isNull();
        assertThat(CustomerService.normalizePhoneNumber("   ")).isNull();
    }

    @Test
    @DisplayName("Should reject invalid phone numbers that do not match 10-digit Indian mobile format")
    void testInvalidPhoneRejection() {
        assertThatThrownBy(() -> CustomerService.normalizePhoneNumber("12345"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("invalid");

        assertThatThrownBy(() -> CustomerService.normalizePhoneNumber("1234567890")) // Doesn't start with 6-9
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("invalid");

        assertThatThrownBy(() -> CustomerService.normalizePhoneNumber("abcdefghij"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("Should find existing customer by normalized phone to prevent duplicate profiles")
    void testPreventDuplicateCustomerProfiles() {
        Customer existing = new Customer("9876543210", "Existing Customer", "test@stationstories.com");
        existing.setId(1L);

        when(customerRepository.findByPhone("9876543210")).thenReturn(Optional.of(existing));

        Customer result = customerService.findOrCreateCustomer("+91 98765 43210", "Updated Name");
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getPhone()).isEqualTo("9876543210");
    }

    @Test
    @DisplayName("Should create a new customer if phone does not exist")
    void testCreateNewCustomer() {
        when(customerRepository.existsByPhone("9876543210")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            c.setId(10L);
            return c;
        });

        CustomerRequest request = new CustomerRequest("+919876543210", "New Customer", "new@stationstories.com");
        CustomerResponse response = customerService.createCustomer(request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getPhone()).isEqualTo("9876543210");
        assertThat(response.getName()).isEqualTo("New Customer");
    }
}

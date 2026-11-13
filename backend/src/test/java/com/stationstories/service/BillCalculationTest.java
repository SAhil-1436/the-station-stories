package com.stationstories.service;

import com.stationstories.dto.bill.BillItemRequest;
import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CreateBillRequest;
import com.stationstories.entity.*;
import com.stationstories.entity.enums.DiscountType;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.BillNumberSequenceRepository;
import com.stationstories.repository.BillOperationRepository;
import com.stationstories.repository.BillRepository;
import com.stationstories.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BillCalculationTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillNumberSequenceRepository sequenceRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private RestaurantSettingService settingService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private BillOperationRepository billOperationRepository;

    private BillOperationRegistrationService billOperationRegistrationService;
    private BillProcessingService billProcessingService;
    private BillService billService;

    private User testCashier;
    private RestaurantSetting defaultSettings;
    private MenuItem burger;
    private MenuItem fries;

    @BeforeEach
    void setUp() {
        testCashier = new User("cashier1", "hash", "John Cashier", "9876543210", "TSS-EMP-001");
        testCashier.setId(10L);

        defaultSettings = new RestaurantSetting();
        defaultSettings.setRestaurantName("THE STATION STORIES");
        defaultSettings.setGstEnabled(false);
        defaultSettings.setCgstRate(BigDecimal.ZERO);
        defaultSettings.setSgstRate(BigDecimal.ZERO);

        Category category = new Category("Fast Food", null, 1, true, null);
        category.setId(1L);

        burger = new MenuItem(category, "Station Veg Burger", null, "Crispy patty",
                BigDecimal.valueOf(100.00), true, true, null, false, 0, 1);
        burger.setId(101L);

        fries = new MenuItem(category, "French Fries", null, "Golden fries",
                BigDecimal.valueOf(50.00), true, true, null, false, 0, 2);
        fries.setId(102L);

        when(settingService.getOrCreateSettings()).thenReturn(defaultSettings);
        when(sequenceRepository.findBySequenceDateForUpdate(any(LocalDate.class)))
                .thenReturn(Optional.of(new BillNumberSequence(LocalDate.now(), 5)));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
            Bill b = invocation.getArgument(0);
            b.setId(500L);
            return b;
        });

        billProcessingService = new BillProcessingService(
                billRepository, sequenceRepository, menuItemRepository, customerService, settingService, auditLogService
        );
        billOperationRegistrationService = mock(BillOperationRegistrationService.class);
        when(billOperationRegistrationService.claimOperation(any(), any(), any()))
                .thenAnswer(inv -> new BillOperation(inv.getArgument(0), inv.getArgument(1), BillOperation.STATUS_PROCESSING));

        billService = new BillService(
                billRepository, sequenceRepository, menuItemRepository, customerService, settingService, auditLogService,
                billOperationRepository, billOperationRegistrationService, billProcessingService
        );
    }

    @Test
    @DisplayName("Should compute subtotal and grand total accurately with GST disabled (0.00% tax)")
    void testStandardBillCalculationWithoutTax() {
        when(menuItemRepository.findById(101L)).thenReturn(Optional.of(burger));
        when(menuItemRepository.findById(102L)).thenReturn(Optional.of(fries));

        CreateBillRequest request = new CreateBillRequest();
        request.setOrderType(OrderType.DINE_IN);
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setDiscountType(DiscountType.NONE);
        request.setItems(Arrays.asList(
                new BillItemRequest(101L, 2, "Extra crispy"), // 2 * 100 = 200
                new BillItemRequest(102L, 1, null)             // 1 * 50 = 50
        ));

        BillResponse response = billService.createBill(request, testCashier);

        assertThat(response.getSubtotal()).isEqualByComparingTo("250.00");
        assertThat(response.getDiscountAmount()).isEqualByComparingTo("0.00");
        assertThat(response.getTaxRate()).isEqualByComparingTo("0.00");
        assertThat(response.getTotalTax()).isEqualByComparingTo("0.00");
        assertThat(response.getGrandTotal()).isEqualByComparingTo("250.00");
        assertThat(response.getBillNumber()).contains("TSS-");
        assertThat(response.getItems()).hasSize(2);
    }

    @Test
    @DisplayName("Should calculate percentage discount correctly and apply on subtotal")
    void testPercentageDiscountCalculation() {
        when(menuItemRepository.findById(101L)).thenReturn(Optional.of(burger));

        CreateBillRequest request = new CreateBillRequest();
        request.setOrderType(OrderType.TAKEAWAY);
        request.setPaymentMethod(PaymentMethod.UPI);
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(BigDecimal.valueOf(10.00)); // 10% off
        request.setItems(Arrays.asList(
                new BillItemRequest(101L, 2, null) // 2 * 100 = 200
        ));

        BillResponse response = billService.createBill(request, testCashier);

        assertThat(response.getSubtotal()).isEqualByComparingTo("200.00");
        assertThat(response.getDiscountAmount()).isEqualByComparingTo("20.00"); // 10% of 200 = 20
        assertThat(response.getGrandTotal()).isEqualByComparingTo("180.00");
    }

    @Test
    @DisplayName("Should calculate flat discount correctly and cap discount if it exceeds subtotal")
    void testFlatDiscountCalculationCappedAtSubtotal() {
        when(menuItemRepository.findById(102L)).thenReturn(Optional.of(fries));

        CreateBillRequest request = new CreateBillRequest();
        request.setOrderType(OrderType.DINE_IN);
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setDiscountType(DiscountType.FLAT);
        request.setDiscountValue(BigDecimal.valueOf(100.00)); // 100 flat discount on 50 subtotal
        request.setItems(Arrays.asList(
                new BillItemRequest(102L, 1, null) // 1 * 50 = 50
        ));

        BillResponse response = billService.createBill(request, testCashier);

        assertThat(response.getSubtotal()).isEqualByComparingTo("50.00");
        assertThat(response.getDiscountAmount()).isEqualByComparingTo("50.00"); // Capped at subtotal
        assertThat(response.getGrandTotal()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Should calculate CGST and SGST accurately when GST is dynamically enabled")
    void testGstCalculationWhenEnabled() {
        defaultSettings.setGstEnabled(true);
        defaultSettings.setCgstRate(BigDecimal.valueOf(2.50));
        defaultSettings.setSgstRate(BigDecimal.valueOf(2.50));

        when(menuItemRepository.findById(101L)).thenReturn(Optional.of(burger));

        CreateBillRequest request = new CreateBillRequest();
        request.setOrderType(OrderType.DINE_IN);
        request.setPaymentMethod(PaymentMethod.UPI);
        request.setDiscountType(DiscountType.NONE);
        request.setItems(Arrays.asList(
                new BillItemRequest(101L, 2, null) // 2 * 100 = 200
        ));

        BillResponse response = billService.createBill(request, testCashier);

        assertThat(response.getSubtotal()).isEqualByComparingTo("200.00");
        assertThat(response.getCgstAmount()).isEqualByComparingTo("5.00");  // 2.5% of 200 = 5.00
        assertThat(response.getSgstAmount()).isEqualByComparingTo("5.00");  // 2.5% of 200 = 5.00
        assertThat(response.getTotalTax()).isEqualByComparingTo("10.00");   // Total 5% = 10.00
        assertThat(response.getGrandTotal()).isEqualByComparingTo("210.00");
    }

    @Test
    @DisplayName("Should reject bill creation when an item is marked unavailable")
    void testUnavailableItemRejection() {
        burger.setAvailable(false);
        when(menuItemRepository.findById(101L)).thenReturn(Optional.of(burger));

        CreateBillRequest request = new CreateBillRequest();
        request.setOrderType(OrderType.DINE_IN);
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setItems(Arrays.asList(
                new BillItemRequest(101L, 1, null)
        ));

        assertThatThrownBy(() -> billService.createBill(request, testCashier))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("currently out of stock");
    }

    @Test
    @DisplayName("Should preserve frozen snapshot in bill items independently of menu price updates")
    void testPriceSnapshotPreservation() {
        when(menuItemRepository.findById(101L)).thenReturn(Optional.of(burger));

        CreateBillRequest request = new CreateBillRequest();
        request.setOrderType(OrderType.DINE_IN);
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setItems(Arrays.asList(new BillItemRequest(101L, 1, null)));

        BillResponse response = billService.createBill(request, testCashier);
        assertThat(response.getItems().get(0).getUnitPrice()).isEqualByComparingTo("100.00");

        // Simulate catalog price modification
        burger.setPrice(BigDecimal.valueOf(150.00));

        // Historical bill item snapshot remains 100.00
        assertThat(response.getItems().get(0).getUnitPrice()).isEqualByComparingTo("100.00");
    }
}

package com.stationstories.service;

import com.stationstories.dto.report.DashboardReportResponse;
import com.stationstories.entity.Bill;
import com.stationstories.entity.BillItem;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.repository.BillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BillRepository billRepository;

    public ReportService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @Transactional(readOnly = true)
    public DashboardReportResponse getTodayDashboardMetrics() {
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(zone);
        Date startOfDay = Date.from(today.atStartOfDay(zone).toInstant());
        Date endOfDay = Date.from(today.plusDays(1).atStartOfDay(zone).toInstant());

        List<Bill> todayPaidBills = billRepository.findPaidBillsBetween(startOfDay.toInstant(), endOfDay.toInstant());

        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal cashSales = BigDecimal.ZERO;
        BigDecimal upiSales = BigDecimal.ZERO;
        BigDecimal otherSales = BigDecimal.ZERO;
        Map<String, ItemAggregation> itemStats = new HashMap<>();

        for (Bill bill : todayPaidBills) {
            BigDecimal grandTotal = bill.getGrandTotal();
            totalSales = totalSales.add(grandTotal);

            if (bill.getPaymentMethod() == PaymentMethod.CASH) {
                cashSales = cashSales.add(grandTotal);
            } else if (bill.getPaymentMethod() == PaymentMethod.UPI) {
                upiSales = upiSales.add(grandTotal);
            } else {
                otherSales = otherSales.add(grandTotal);
            }

            if (bill.getItems() != null) {
                for (BillItem item : bill.getItems()) {
                    String name = item.getItemName();
                    ItemAggregation agg = itemStats.computeIfAbsent(name, k -> new ItemAggregation(name));
                    agg.quantity += item.getQuantity();
                    agg.revenue = agg.revenue.add(item.getSubtotal());
                }
            }
        }

        long orderCount = todayPaidBills.size();
        BigDecimal avgOrderValue = orderCount > 0
                ? totalSales.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<DashboardReportResponse.TopSellingItemDto> topSelling = itemStats.values().stream()
                .sorted(Comparator.comparingLong((ItemAggregation a) -> a.quantity).reversed())
                .limit(5)
                .map(a -> new DashboardReportResponse.TopSellingItemDto(a.name, a.quantity, a.revenue))
                .collect(Collectors.toList());

        DashboardReportResponse response = new DashboardReportResponse();
        response.setTodayTotalSales(totalSales.setScale(2, RoundingMode.HALF_UP));
        response.setTodayOrderCount(orderCount);
        response.setTodayPaidBills(orderCount);
        response.setTodayCancelledBills(0);
        response.setTodayCashSales(cashSales.setScale(2, RoundingMode.HALF_UP));
        response.setTodayUpiSales(upiSales.setScale(2, RoundingMode.HALF_UP));
        response.setTodayOtherSales(otherSales.setScale(2, RoundingMode.HALF_UP));
        response.setAverageOrderValue(avgOrderValue);
        response.setTopSellingItems(topSelling);

        return response;
    }

    private static class ItemAggregation {
        String name;
        long quantity = 0;
        BigDecimal revenue = BigDecimal.ZERO;

        ItemAggregation(String name) {
            this.name = name;
        }
    }
}

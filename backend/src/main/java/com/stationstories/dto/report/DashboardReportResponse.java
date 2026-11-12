package com.stationstories.dto.report;

import java.math.BigDecimal;
import java.util.List;

public class DashboardReportResponse {
    private BigDecimal todayTotalSales;
    private long todayOrderCount;
    private long todayPaidBills;
    private long todayCancelledBills;
    private BigDecimal todayCashSales;
    private BigDecimal todayUpiSales;
    private BigDecimal todayOtherSales;
    private BigDecimal averageOrderValue;
    private List<TopSellingItemDto> topSellingItems;

    public DashboardReportResponse() {}

    public static class TopSellingItemDto {
        private String itemName;
        private long quantitySold;
        private BigDecimal totalRevenue;

        public TopSellingItemDto() {}

        public TopSellingItemDto(String itemName, long quantitySold, BigDecimal totalRevenue) {
            this.itemName = itemName;
            this.quantitySold = quantitySold;
            this.totalRevenue = totalRevenue;
        }

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
        }

        public long getQuantitySold() {
            return quantitySold;
        }

        public void setQuantitySold(long quantitySold) {
            this.quantitySold = quantitySold;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }

    public BigDecimal getTodayTotalSales() {
        return todayTotalSales;
    }

    public void setTodayTotalSales(BigDecimal todayTotalSales) {
        this.todayTotalSales = todayTotalSales;
    }

    public long getTodayOrderCount() {
        return todayOrderCount;
    }

    public void setTodayOrderCount(long todayOrderCount) {
        this.todayOrderCount = todayOrderCount;
    }

    public long getTodayPaidBills() {
        return todayPaidBills;
    }

    public void setTodayPaidBills(long todayPaidBills) {
        this.todayPaidBills = todayPaidBills;
    }

    public long getTodayCancelledBills() {
        return todayCancelledBills;
    }

    public void setTodayCancelledBills(long todayCancelledBills) {
        this.todayCancelledBills = todayCancelledBills;
    }

    public BigDecimal getTodayCashSales() {
        return todayCashSales;
    }

    public void setTodayCashSales(BigDecimal todayCashSales) {
        this.todayCashSales = todayCashSales;
    }

    public BigDecimal getTodayUpiSales() {
        return todayUpiSales;
    }

    public void setTodayUpiSales(BigDecimal todayUpiSales) {
        this.todayUpiSales = todayUpiSales;
    }

    public BigDecimal getTodayOtherSales() {
        return todayOtherSales;
    }

    public void setTodayOtherSales(BigDecimal todayOtherSales) {
        this.todayOtherSales = todayOtherSales;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public List<TopSellingItemDto> getTopSellingItems() {
        return topSellingItems;
    }

    public void setTopSellingItems(List<TopSellingItemDto> topSellingItems) {
        this.topSellingItems = topSellingItems;
    }
}

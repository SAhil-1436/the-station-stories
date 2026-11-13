package com.stationstories.repository;

import com.stationstories.entity.Bill;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByInvoiceUuid(String invoiceUuid);

    Optional<Bill> findByBillNumber(String billNumber);

    Optional<Bill> findByIdempotencyKey(String idempotencyKey);

    List<Bill> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT b FROM Bill b WHERE " +
           "(:status IS NULL OR b.paymentStatus = :status) AND " +
           "(:method IS NULL OR b.paymentMethod = :method) AND " +
           "(:fromDate IS NULL OR b.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR b.createdAt <= :toDate) AND " +
           "b.isDeleted = false")
    Page<Bill> searchBills(@Param("status") PaymentStatus status,
                           @Param("method") PaymentMethod method,
                           @Param("fromDate") Instant fromDate,
                           @Param("toDate") Instant toDate,
                           Pageable pageable);

    @Query("SELECT b FROM Bill b WHERE b.createdAt >= :startDate AND b.createdAt < :endDate AND b.paymentStatus = 'PAID'")
    List<Bill> findPaidBillsBetween(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}

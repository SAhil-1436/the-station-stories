package com.stationstories.repository;

import com.stationstories.entity.BillOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillOperationRepository extends JpaRepository<BillOperation, Long> {

    Optional<BillOperation> findByOperationKey(String operationKey);

    boolean existsByOperationKey(String operationKey);
}

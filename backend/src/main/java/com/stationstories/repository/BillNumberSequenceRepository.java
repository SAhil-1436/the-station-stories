package com.stationstories.repository;

import com.stationstories.entity.BillNumberSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface BillNumberSequenceRepository extends JpaRepository<BillNumberSequence, LocalDate> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM BillNumberSequence s WHERE s.sequenceDate = :date")
    Optional<BillNumberSequence> findBySequenceDateForUpdate(@Param("date") LocalDate date);
}

package com.stationstories.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bill_number_sequences")
public class BillNumberSequence {

    @Id
    @Column(name = "sequence_date", nullable = false)
    private LocalDate sequenceDate;

    @Column(name = "current_sequence", nullable = false)
    private int currentSequence = 0;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public BillNumberSequence() {}

    public BillNumberSequence(LocalDate sequenceDate, int currentSequence) {
        this.sequenceDate = sequenceDate;
        this.currentSequence = currentSequence;
        this.updatedAt = Instant.now();
    }

    public int incrementAndGet() {
        this.currentSequence++;
        this.updatedAt = Instant.now();
        return this.currentSequence;
    }

    public LocalDate getSequenceDate() {
        return sequenceDate;
    }

    public void setSequenceDate(LocalDate sequenceDate) {
        this.sequenceDate = sequenceDate;
    }

    public int getCurrentSequence() {
        return currentSequence;
    }

    public void setCurrentSequence(int currentSequence) {
        this.currentSequence = currentSequence;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

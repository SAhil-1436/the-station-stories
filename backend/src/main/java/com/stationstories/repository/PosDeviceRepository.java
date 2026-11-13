package com.stationstories.repository;

import com.stationstories.entity.PosDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PosDeviceRepository extends JpaRepository<PosDevice, Long> {
    Optional<PosDevice> findByDeviceId(String deviceId);
    boolean existsByDeviceId(String deviceId);
    List<PosDevice> findByRegisteredById(Long userId);
}

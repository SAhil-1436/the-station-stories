package com.stationstories.repository;

import com.stationstories.entity.RestaurantSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantSettingRepository extends JpaRepository<RestaurantSetting, Long> {
    default Optional<RestaurantSetting> getSingletonSettings() {
        return findById(1L);
    }
}

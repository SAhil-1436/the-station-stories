package com.stationstories.repository;

import com.stationstories.entity.MenuItem;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long>, JpaSpecificationExecutor<MenuItem> {
    
    List<MenuItem> findByIsAvailableTrue(Sort sort);
    
    List<MenuItem> findByCategoryIdAndIsAvailableTrue(Long categoryId, Sort sort);
    
    long countByCategoryId(Long categoryId);
    
    long countByCategoryIdAndIsAvailableTrue(Long categoryId);

    @Query("SELECT m FROM MenuItem m WHERE m.isAvailable = true AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:isVeg IS NULL OR m.isVeg = :isVeg) AND " +
           "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<MenuItem> searchPublicMenu(@Param("categoryId") Long categoryId,
                                    @Param("isVeg") Boolean isVeg,
                                    @Param("search") String search,
                                    Sort sort);
}

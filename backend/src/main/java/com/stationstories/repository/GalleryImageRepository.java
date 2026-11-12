package com.stationstories.repository;

import com.stationstories.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
    List<GalleryImage> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<GalleryImage> findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(String category);
}

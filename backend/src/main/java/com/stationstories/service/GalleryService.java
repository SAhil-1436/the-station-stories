package com.stationstories.service;

import com.stationstories.dto.menu.GalleryImageResponse;
import com.stationstories.entity.GalleryImage;
import com.stationstories.repository.GalleryImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GalleryService {

    private final GalleryImageRepository galleryImageRepository;

    public GalleryService(GalleryImageRepository galleryImageRepository) {
        this.galleryImageRepository = galleryImageRepository;
    }

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> getGallery(String category) {
        List<GalleryImage> images = (category != null && !category.trim().isEmpty())
                ? galleryImageRepository.findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category.trim().toUpperCase())
                : galleryImageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        return images.stream()
                .map(img -> new GalleryImageResponse(
                        img.getId(),
                        img.getTitle(),
                        img.getCategory(),
                        img.getImageUrl(),
                        img.getDisplayOrder(),
                        img.isActive(),
                        img.isOriginal()
                ))
                .collect(Collectors.toList());
    }
}

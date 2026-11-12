package com.stationstories.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    String storeImage(MultipartFile file, String subfolder);
    void deleteImage(String imageUrl);
}

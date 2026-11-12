package com.stationstories.service.impl;

import com.stationstories.exception.BusinessException;
import com.stationstories.service.ImageStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileSystemImageStorageService implements ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileSystemImageStorageService.class);

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");

    @Value("${app.storage.upload-dir:frontend/public/images/}")
    private String uploadBaseDir;

    @Override
    public String storeImage(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("File name is invalid");
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException("Invalid file extension. Allowed extensions: JPG, JPEG, PNG, WEBP");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Invalid image content type: " + contentType);
        }

        String cleanSubfolder = subfolder != null ? subfolder.replaceAll("[^a-zA-Z0-9_-]", "") : "food";
        String generatedFilename = UUID.randomUUID().toString() + extension;

        Path targetDir = Paths.get(uploadBaseDir, cleanSubfolder).normalize().toAbsolutePath();
        try {
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(generatedFilename).normalize();

            // Guard against path traversal
            if (!targetPath.startsWith(targetDir)) {
                throw new BusinessException("Invalid path traversal detected");
            }

            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Stored image successfully: {}", targetPath);
            return "/images/" + cleanSubfolder + "/" + generatedFilename;
        } catch (IOException ex) {
            log.error("Failed to store uploaded image: {}", ex.getMessage());
            throw new BusinessException("Failed to save image file: " + ex.getMessage());
        }
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/images/")) {
            return;
        }
        try {
            String relativePath = imageUrl.substring("/images/".length());
            Path targetFile = Paths.get(uploadBaseDir, relativePath).normalize().toAbsolutePath();
            Path baseDir = Paths.get(uploadBaseDir).normalize().toAbsolutePath();
            if (targetFile.startsWith(baseDir) && Files.exists(targetFile)) {
                Files.delete(targetFile);
                log.info("Deleted image file: {}", targetFile);
            }
        } catch (Exception ex) {
            log.warn("Failed to delete image: {}", ex.getMessage());
        }
    }
}

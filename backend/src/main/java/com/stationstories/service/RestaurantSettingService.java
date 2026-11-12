package com.stationstories.service;

import com.stationstories.dto.setting.RestaurantSettingRequest;
import com.stationstories.dto.setting.RestaurantSettingResponse;
import com.stationstories.entity.RestaurantSetting;
import com.stationstories.entity.User;
import com.stationstories.repository.RestaurantSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class RestaurantSettingService {

    private final RestaurantSettingRepository settingRepository;
    private final AuditLogService auditLogService;

    public RestaurantSettingService(RestaurantSettingRepository settingRepository,
                                    AuditLogService auditLogService) {
        this.settingRepository = settingRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public RestaurantSetting getOrCreateSettings() {
        return settingRepository.findById(1L).orElseGet(() -> {
            RestaurantSetting defaultSetting = new RestaurantSetting();
            defaultSetting.setId(1L);
            defaultSetting.setRestaurantName("THE STATION STORIES");
            defaultSetting.setTagline("Fast Food & Restaurant");
            defaultSetting.setAddress("[Pending Owner Confirmation - Placeholder Address]");
            defaultSetting.setPhonePrimary("[Pending Owner Confirmation]");
            defaultSetting.setWhatsappNumber("[Pending Owner Confirmation]");
            defaultSetting.setOpeningHours("11:00 AM - 11:00 PM");
            defaultSetting.setGstEnabled(false);
            defaultSetting.setCgstRate(BigDecimal.ZERO);
            defaultSetting.setSgstRate(BigDecimal.ZERO);
            defaultSetting.setCurrencySymbol("₹");
            return settingRepository.save(defaultSetting);
        });
    }

    @Transactional(readOnly = true)
    public RestaurantSettingResponse getSettingsResponse() {
        return mapToResponse(getOrCreateSettings());
    }

    @Transactional
    public RestaurantSettingResponse updateSettings(RestaurantSettingRequest request, User admin) {
        RestaurantSetting settings = getOrCreateSettings();

        boolean taxPolicyChanged = (settings.isGstEnabled() != request.getGstEnabled()) ||
                (settings.getCgstRate().compareTo(request.getCgstRate()) != 0) ||
                (settings.getSgstRate().compareTo(request.getSgstRate()) != 0);

        String oldTax = "GST: " + settings.isGstEnabled() + ", CGST: " + settings.getCgstRate() + "%, SGST: " + settings.getSgstRate() + "%";

        settings.setRestaurantName(request.getRestaurantName().trim());
        settings.setTagline(request.getTagline() != null ? request.getTagline().trim() : null);
        settings.setAddress(request.getAddress().trim());
        settings.setPhonePrimary(request.getPhonePrimary().trim());
        settings.setPhoneSecondary(request.getPhoneSecondary() != null ? request.getPhoneSecondary().trim() : null);
        settings.setWhatsappNumber(request.getWhatsappNumber().trim());
        settings.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        settings.setGstEnabled(request.getGstEnabled());
        settings.setGstin(request.getGstin() != null ? request.getGstin().trim() : null);
        settings.setCgstRate(request.getCgstRate());
        settings.setSgstRate(request.getSgstRate());
        settings.setUpiId(request.getUpiId() != null ? request.getUpiId().trim() : null);
        settings.setCurrencySymbol(request.getCurrencySymbol().trim());
        settings.setOpeningHours(request.getOpeningHours().trim());
        settings.setGoogleMapsUrl(request.getGoogleMapsUrl() != null ? request.getGoogleMapsUrl().trim() : null);
        settings.setInstagramHandle(request.getInstagramHandle() != null ? request.getInstagramHandle().trim() : null);

        RestaurantSetting updated = settingRepository.save(settings);

        if (taxPolicyChanged) {
            String newTax = "GST: " + updated.isGstEnabled() + ", CGST: " + updated.getCgstRate() + "%, SGST: " + updated.getSgstRate() + "%";
            auditLogService.recordEvent("SETTING", 1L, "TAX_POLICY_CHANGED", admin, oldTax, newTax, null);
        } else {
            auditLogService.recordEvent("SETTING", 1L, "SETTINGS_UPDATED", admin, null, "Settings updated", null);
        }

        return mapToResponse(updated);
    }

    public RestaurantSettingResponse mapToResponse(RestaurantSetting s) {
        RestaurantSettingResponse res = new RestaurantSettingResponse();
        res.setRestaurantName(s.getRestaurantName());
        res.setTagline(s.getTagline());
        res.setAddress(s.getAddress());
        res.setPhonePrimary(s.getPhonePrimary());
        res.setPhoneSecondary(s.getPhoneSecondary());
        res.setWhatsappNumber(s.getWhatsappNumber());
        res.setEmail(s.getEmail());
        res.setGstEnabled(s.isGstEnabled());
        res.setGstin(s.getGstin());
        res.setCgstRate(s.getCgstRate());
        res.setSgstRate(s.getSgstRate());
        res.setUpiId(s.getUpiId());
        res.setCurrencySymbol(s.getCurrencySymbol());
        res.setOpeningHours(s.getOpeningHours());
        res.setGoogleMapsUrl(s.getGoogleMapsUrl());
        res.setInstagramHandle(s.getInstagramHandle());
        res.setUpdatedAt(s.getUpdatedAt());
        return res;
    }
}

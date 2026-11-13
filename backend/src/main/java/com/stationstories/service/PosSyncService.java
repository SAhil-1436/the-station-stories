package com.stationstories.service;

import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CreateBillRequest;
import com.stationstories.dto.pos.SyncBillRequest;
import com.stationstories.dto.pos.SyncBillResponse;
import com.stationstories.entity.Bill;
import com.stationstories.entity.User;
import com.stationstories.repository.BillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PosSyncService {

    private static final Logger log = LoggerFactory.getLogger(PosSyncService.class);

    private final BillService billService;
    private final BillRepository billRepository;
    private final RestaurantSettingService settingService;
    private final PosDeviceService posDeviceService;

    public PosSyncService(BillService billService,
                          BillRepository billRepository,
                          RestaurantSettingService settingService,
                          PosDeviceService posDeviceService) {
        this.billService = billService;
        this.billRepository = billRepository;
        this.settingService = settingService;
        this.posDeviceService = posDeviceService;
    }

    public SyncBillResponse syncSingleBill(SyncBillRequest syncReq, User cashier) {
        if (syncReq.getClientOperationUuid() == null || syncReq.getClientOperationUuid().trim().isEmpty()) {
            return SyncBillResponse.failed(null, syncReq.getLocalBillReference(), "Missing clientOperationUuid");
        }

        String uuid = syncReq.getClientOperationUuid().trim();
        String localRef = syncReq.getLocalBillReference() != null ? syncReq.getLocalBillReference().trim() : "OFF-UNKNOWN";

        // 1. Verify device is active and not revoked if provided
        if (syncReq.getDeviceId() != null && !syncReq.getDeviceId().trim().isEmpty()) {
            if (!posDeviceService.isDeviceActive(syncReq.getDeviceId().trim())) {
                log.warn("Offline sync rejected: Device {} is revoked or not registered", syncReq.getDeviceId());
                return SyncBillResponse.needsReview(uuid, localRef, "Device is revoked or not registered on server");
            }
        }

        // 2. Check if this client operation UUID is already synchronized
        Optional<Bill> existing = billRepository.findByIdempotencyKey(uuid);
        if (existing.isPresent()) {
            log.info("Offline bill with UUID {} already synchronized with bill #{}", uuid, existing.get().getBillNumber());
            BillResponse response = billService.mapToResponse(existing.get(), settingService.getOrCreateSettings());
            return SyncBillResponse.alreadySynced(uuid, localRef, response);
        }

        // 3. Convert SyncBillRequest to CreateBillRequest
        CreateBillRequest createReq = new CreateBillRequest();
        createReq.setOrderType(syncReq.getOrderType());
        createReq.setCabinTableRef(syncReq.getCabinTableRef());
        createReq.setCustomerPhone(syncReq.getCustomerPhone());
        createReq.setCustomerName(syncReq.getCustomerName());
        createReq.setPaymentMethod(syncReq.getPaymentMethod());
        createReq.setNotes(syncReq.getNotes());
        createReq.setIdempotencyKey(uuid);
        createReq.setLocalBillReference(localRef);
        createReq.setDeviceId(syncReq.getDeviceId());
        createReq.setIsOfflineCreated(true);
        createReq.setItems(syncReq.getItems());

        try {
            BillResponse createdBill = billService.createBill(createReq, cashier, uuid);
            log.info("Successfully synchronized offline bill {} -> Server Bill #{}", localRef, createdBill.getBillNumber());
            return SyncBillResponse.synced(uuid, localRef, createdBill);
        } catch (Exception ex) {
            log.error("Failed to synchronize offline bill {}: {}", localRef, ex.getMessage());
            return SyncBillResponse.failed(uuid, localRef, ex.getMessage());
        }
    }

    public List<SyncBillResponse> syncBatch(List<SyncBillRequest> requests, User cashier) {
        List<SyncBillResponse> results = new ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }

        for (SyncBillRequest req : requests) {
            results.add(syncSingleBill(req, cashier));
        }

        return results;
    }
}

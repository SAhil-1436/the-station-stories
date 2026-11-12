package com.stationstories.service;

import com.stationstories.dto.audit.AuditLogResponse;
import com.stationstories.entity.AuditLog;
import com.stationstories.entity.User;
import com.stationstories.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void recordEvent(String entityName, Long entityId, String action, User performedBy, String oldValue, String newValue, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(entityName, entityId, action, performedBy, oldValue, newValue, ipAddress);
            auditLogRepository.save(auditLog);
            log.info("Audit log recorded: {} on {} (ID: {}) by {}", action, entityName, entityId,
                    performedBy != null ? performedBy.getUsername() : "SYSTEM");
        } catch (Exception ex) {
            log.error("Failed to record audit log: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getRecentAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getEntityName(),
                log.getEntityId(),
                log.getAction(),
                log.getPerformedBy() != null ? log.getPerformedBy().getUsername() : "SYSTEM",
                log.getOldValue(),
                log.getNewValue(),
                log.getIpAddress(),
                log.getCreatedAt()
        );
    }
}

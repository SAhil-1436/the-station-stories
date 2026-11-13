package com.stationstories.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.Base64;

/**
 * Manages asymmetric RSA key pairs for device enrollment and offline lease verification.
 * The private signing key stays strictly on the backend.
 * The public verification key is exposed to the frontend PWA to verify offline leases via Web Crypto.
 */
@Service
public class PosKeyManagementService {

    private static final Logger log = LoggerFactory.getLogger(PosKeyManagementService.class);

    private KeyPair keyPair;

    @PostConstruct
    public void init() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            this.keyPair = generator.generateKeyPair();
            log.info("Initialized RSA 2048-bit keypair for offline POS lease authorization");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Failed to initialize RSA KeyPairGenerator", e);
        }
    }

    /**
     * Signs the given payload string using SHA256withRSA.
     */
    public String signPayload(String payload) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(keyPair.getPrivate());
            signature.update(payload.getBytes(StandardCharsets.UTF_8));
            byte[] signedBytes = signature.sign();
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signedBytes);
        } catch (Exception e) {
            log.error("Failed to sign payload with RSA private key", e);
            throw new RuntimeException("Asymmetric signing failed", e);
        }
    }

    /**
     * Returns the Base64-encoded SPKI bytes of the RSA public key.
     */
    public String getPublicKeySpkiBase64() {
        byte[] spki = keyPair.getPublic().getEncoded();
        return Base64.getEncoder().encodeToString(spki);
    }

    /**
     * Returns the Public Key in standard PEM format.
     */
    public String getPublicKeyPem() {
        String base64 = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PUBLIC KEY-----\n");
        int index = 0;
        while (index < base64.length()) {
            int end = Math.min(index + 64, base64.length());
            pem.append(base64, index, end).append("\n");
            index = end;
        }
        pem.append("-----END PUBLIC KEY-----\n");
        return pem.toString();
    }
}

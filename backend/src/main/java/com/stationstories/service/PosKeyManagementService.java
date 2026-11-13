package com.stationstories.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Set;

/**
 * Manages persistent asymmetric RSA-2048 key pairs for POS device enrollment and offline lease authorization.
 *
 * Requirements:
 * 1. Persistent Storage: Keys are NOT regenerated upon application restart; they are persisted
 *    securely to server-side key storage and reloaded consistently.
 * 2. Fail-Safe: If key storage is missing one key or corrupted, fails safely rather than silently
 *    generating a new key that would invalidate previously issued active leases.
 * 3. Security: The private key is never exposed via any API or transmitted to frontend terminals.
 * 4. Token Format: Provides SHA256withRSA signing conforming to compact JWS (RFC 7515 / RS256).
 */
@Service
public class PosKeyManagementService {

    private static final Logger log = LoggerFactory.getLogger(PosKeyManagementService.class);
    private static final String ALGORITHM = "RSA";
    private static final int KEY_SIZE = 2048;
    private static final String SIGNATURE_ALGORITHM = "SHA256withRSA";

    private final String keysDir;
    private KeyPair keyPair;

    public PosKeyManagementService(@Value("${app.pos.keys.dir:secrets/pos-keys}") String keysDir) {
        this.keysDir = keysDir;
    }

    @PostConstruct
    public void init() {
        try {
            Path dir = Paths.get(keysDir);
            Path privDerPath = dir.resolve("pos_private_key.der");
            Path pubDerPath = dir.resolve("pos_public_key.der");
            Path privPemPath = dir.resolve("pos_private_key.pem");
            Path pubPemPath = dir.resolve("pos_public_key.pem");

            boolean privExists = Files.exists(privDerPath);
            boolean pubExists = Files.exists(pubDerPath);

            if (privExists && pubExists) {
                // Load existing persisted key pair
                this.keyPair = loadKeyPairFromDisk(privDerPath, pubDerPath);
                log.info("Successfully loaded existing persistent RSA 2048-bit keypair from {}", dir.toAbsolutePath());
            } else if (!privExists && !pubExists) {
                // Securely generate and persist new key pair
                Files.createDirectories(dir);
                KeyPairGenerator generator = KeyPairGenerator.getInstance(ALGORITHM);
                generator.initialize(KEY_SIZE);
                this.keyPair = generator.generateKeyPair();

                persistKeyPairToDisk(privDerPath, pubDerPath, privPemPath, pubPemPath);
                log.info("Generated and securely persisted new RSA 2048-bit keypair to {}", dir.toAbsolutePath());
            } else {
                // Inconsistent state: one key exists but the other is missing
                String msg = String.format(
                        "Inconsistent POS RSA key storage in %s: privateKeyExists=%b, publicKeyExists=%b. " +
                        "Refusing to silently regenerate to prevent invalidating active offline leases.",
                        dir.toAbsolutePath(), privExists, pubExists
                );
                log.error(msg);
                throw new IllegalStateException(msg);
            }
        } catch (Exception e) {
            log.error("Fatal error during POS Key Management initialization", e);
            throw new IllegalStateException("Failed to initialize or load persistent POS RSA keys: " + e.getMessage(), e);
        }
    }

    private KeyPair loadKeyPairFromDisk(Path privPath, Path pubPath) throws Exception {
        byte[] privBytes = Files.readAllBytes(privPath);
        byte[] pubBytes = Files.readAllBytes(pubPath);

        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        PKCS8EncodedKeySpec privSpec = new PKCS8EncodedKeySpec(privBytes);
        PrivateKey privateKey = keyFactory.generatePrivate(privSpec);

        X509EncodedKeySpec pubSpec = new X509EncodedKeySpec(pubBytes);
        PublicKey publicKey = keyFactory.generatePublic(pubSpec);

        return new KeyPair(publicKey, privateKey);
    }

    private void persistKeyPairToDisk(Path privDerPath, Path pubDerPath, Path privPemPath, Path pubPemPath) throws IOException {
        byte[] privBytes = keyPair.getPrivate().getEncoded();
        byte[] pubBytes = keyPair.getPublic().getEncoded();

        // Write DER files
        Files.write(privDerPath, privBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        Files.write(pubDerPath, pubBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // Write PEM files
        String privPem = formatPem("PRIVATE KEY", privBytes);
        String pubPem = formatPem("PUBLIC KEY", pubBytes);
        Files.writeString(privPemPath, privPem, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        Files.writeString(pubPemPath, pubPem, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // Restrict private key permissions on POSIX filesystems (rw-------)
        try {
            Set<PosixFilePermission> ownerOnly = PosixFilePermissions.fromString("rw-------");
            Files.setPosixFilePermissions(privDerPath, ownerOnly);
            Files.setPosixFilePermissions(privPemPath, ownerOnly);
        } catch (UnsupportedOperationException ignored) {
            // Not a POSIX filesystem (e.g. Windows); skip chmod
        }
    }

    /**
     * Signs the given payload string using SHA256withRSA and returns Base64URL string without padding.
     */
    public String signPayload(String payload) {
        if (keyPair == null || keyPair.getPrivate() == null) {
            throw new IllegalStateException("RSA Private Key is not initialized");
        }
        try {
            Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
            signature.initSign(keyPair.getPrivate());
            signature.update(payload.getBytes(StandardCharsets.UTF_8));
            byte[] signedBytes = signature.sign();
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signedBytes);
        } catch (Exception e) {
            log.error("Failed to sign payload with RSA private key", e);
            throw new RuntimeException("Asymmetric signing failed: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies a signature against the payload using the persistent RSA public key.
     */
    public boolean verifySignature(String payload, String signatureBase64) {
        if (keyPair == null || keyPair.getPublic() == null) {
            throw new IllegalStateException("RSA Public Key is not initialized");
        }
        try {
            byte[] sigBytes = decodeBase64Flex(signatureBase64);
            Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
            signature.initVerify(keyPair.getPublic());
            signature.update(payload.getBytes(StandardCharsets.UTF_8));
            return signature.verify(sigBytes);
        } catch (Exception e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }

    /**
     * Returns the Base64-encoded SPKI bytes of the RSA public key.
     */
    public String getPublicKeySpkiBase64() {
        if (keyPair == null || keyPair.getPublic() == null) {
            throw new IllegalStateException("RSA Public Key is not initialized");
        }
        return Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }

    /**
     * Returns the Public Key in standard PEM format.
     */
    public String getPublicKeyPem() {
        if (keyPair == null || keyPair.getPublic() == null) {
            throw new IllegalStateException("RSA Public Key is not initialized");
        }
        return formatPem("PUBLIC KEY", keyPair.getPublic().getEncoded());
    }

    private static String formatPem(String type, byte[] data) {
        String base64 = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(data);
        return String.format("-----BEGIN %s-----\n%s\n-----END %s-----\n", type, base64, type);
    }

    private static byte[] decodeBase64Flex(String str) {
        if (str == null) return new byte[0];
        try {
            return Base64.getUrlDecoder().decode(str);
        } catch (IllegalArgumentException e) {
            return Base64.getDecoder().decode(str);
        }
    }
}

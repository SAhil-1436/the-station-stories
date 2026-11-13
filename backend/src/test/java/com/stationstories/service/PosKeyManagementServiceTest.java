package com.stationstories.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PosKeyManagementServiceTest {

    @Test
    @DisplayName("init: generates and persists new RSA keypair when directory is empty")
    void testGenerateAndPersistNewKeysWhenEmpty(@TempDir Path tempDir) {
        Path keysDir = tempDir.resolve("pos-keys");
        PosKeyManagementService service = new PosKeyManagementService(keysDir.toString());
        service.init();

        Path privDer = keysDir.resolve("pos_private_key.der");
        Path pubDer = keysDir.resolve("pos_public_key.der");
        Path privPem = keysDir.resolve("pos_private_key.pem");
        Path pubPem = keysDir.resolve("pos_public_key.pem");

        assertThat(Files.exists(privDer)).isTrue();
        assertThat(Files.exists(pubDer)).isTrue();
        assertThat(Files.exists(privPem)).isTrue();
        assertThat(Files.exists(pubPem)).isTrue();

        assertThat(service.getPublicKeySpkiBase64()).isNotBlank();
        assertThat(service.getPublicKeyPem()).contains("-----BEGIN PUBLIC KEY-----");
    }

    @Test
    @DisplayName("persistence: reloads existing keys on restart; signatures remain verifiable across restarts")
    void testLoadExistingKeysAcrossReinstantiation(@TempDir Path tempDir) {
        Path keysDir = tempDir.resolve("pos-keys");

        // First instance creates keys and signs payload
        PosKeyManagementService instance1 = new PosKeyManagementService(keysDir.toString());
        instance1.init();

        String payload = "test.offline.lease.payload.data";
        String signature = instance1.signPayload(payload);
        String spki1 = instance1.getPublicKeySpkiBase64();

        assertThat(instance1.verifySignature(payload, signature)).isTrue();

        // Second instance (simulating backend reboot) loads persisted keys
        PosKeyManagementService instance2 = new PosKeyManagementService(keysDir.toString());
        instance2.init();

        String spki2 = instance2.getPublicKeySpkiBase64();
        assertThat(spki2).isEqualTo(spki1);

        // Instance 2 verifies payload signed by instance 1 before reboot
        assertThat(instance2.verifySignature(payload, signature)).isTrue();

        // Instance 2 signs new payload and verifies
        String payload2 = "second.payload";
        String sig2 = instance2.signPayload(payload2);
        assertThat(instance2.verifySignature(payload2, sig2)).isTrue();
    }

    @Test
    @DisplayName("fail-safe: throws IllegalStateException when public key is missing")
    void testFailSafeOnMissingPublicKey(@TempDir Path tempDir) throws Exception {
        Path keysDir = tempDir.resolve("pos-keys");
        Files.createDirectories(keysDir);
        Files.write(keysDir.resolve("pos_private_key.der"), new byte[]{1, 2, 3});

        PosKeyManagementService service = new PosKeyManagementService(keysDir.toString());

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Inconsistent POS RSA key storage");
    }

    @Test
    @DisplayName("fail-safe: throws IllegalStateException when private key is missing")
    void testFailSafeOnMissingPrivateKey(@TempDir Path tempDir) throws Exception {
        Path keysDir = tempDir.resolve("pos-keys");
        Files.createDirectories(keysDir);
        Files.write(keysDir.resolve("pos_public_key.der"), new byte[]{1, 2, 3});

        PosKeyManagementService service = new PosKeyManagementService(keysDir.toString());

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Inconsistent POS RSA key storage");
    }

    @Test
    @DisplayName("tamper-resistance: rejects invalid or altered signatures and payloads")
    void testTamperResistance(@TempDir Path tempDir) {
        Path keysDir = tempDir.resolve("pos-keys");
        PosKeyManagementService service = new PosKeyManagementService(keysDir.toString());
        service.init();

        String payload = "original.payload";
        String signature = service.signPayload(payload);

        // Tampered payload
        assertThat(service.verifySignature("tampered.payload", signature)).isFalse();

        // Tampered signature
        String corruptedSig = signature.substring(0, signature.length() - 4) + "AAAA";
        assertThat(service.verifySignature(payload, corruptedSig)).isFalse();
    }
}

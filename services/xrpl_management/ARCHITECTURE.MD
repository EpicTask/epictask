## EpicTask XRPL Microservice Architecture Overview

This document details the XRPL Microservice, responsible for all interactions with the XRP Ledger in the EpicTask platform. It focuses exclusively on ledger integration, transaction processing, and reliable fallback mechanisms using external wallet providers.

---

### 1. XRPL Microservice Components

*All components incorporate security best practices, including principle of least privilege, encrypted communications, and robust auditing.*

#### 1.1 External Wallet Integration

* **Responsibility**: Connects to third-party wallet providers (e.g., XUMM, Crossmark) for account management and transaction signing.
* **Security Focus**:

  * **OAuth2 / PKCE** for secure connector authentication.
  * **Encrypted Webhooks** to validate provider callbacks.
* **Key Modules**:

  * **Provider Connectors**: Modular drivers for each wallet (XUMM, Crossmark), handling user onboarding, authentication, and request signing under least-privilege scopes.
  * **User Consent Flow**: Ensures end users securely approve and sign transactions via their chosen wallet app, with timeout and nonce protections.

#### 1.2 Transaction Builder & Submission

* **Responsibility**: Constructs XRP ledger transactions and submits them via the chosen wallet or direct API.
* **Security Focus**:

  * **Input Validation & Sanitization** to prevent injection attacks.
  * **Encrypted In-Memory Signing** (when fallback) within HSM-backed processes.
* **Key Modules**:

  * **Payment & Trustline Builder**: Prepares standardized transaction objects with strict schema validation.
  * **Submission Handler**: Routes signed transactions over TLS-encrypted WebSocket or REST.
  * **Error & Retry Logic**: Detects submission failures while ensuring no replay vulnerabilities.

#### 1.3 Ledger Listener & Event Processing

* **Responsibility**: Monitors ledger events to update internal state, confirm transactions, and trigger downstream processes.
* **Security Focus**:

  * **Signature Verification** on ledger events.
  * **Rate Limiting** to thwart potential denial-of-service.
* **Key Modules**:

  * **WebSocket Subscriber**: Securely connects to ledger streams with mutual TLS.
  * **Event Processor**: Validates event authenticity and logs immutably.

#### 1.4 Direct Ledger Fallback

* **Responsibility**: Provides a minimal backup pathway to submit and verify transactions if external wallet providers are unreachable.
* **Security Focus**:

  * **Hardware Security Modules (HSM)** or KMS for emergency key storage.
  * **Time-Limited Credentials** enforced via IAM roles.
* **Key Modules**:

  * **Direct API Client**: Uses XRPL.js or native gRPC/WebSocket calls to `rippled`, signing within secure enclaves.
  * **Security Controls**: Strict audit logging, anomaly detection, and immediate key revocation triggers.

#### 1.5 Data Storage & Caching

* **Databases**:

  * **Firestore**: Cloud Firestore with encrypted-at-rest collections (`transactions`, `wallets`) and field-level security rules.
* **Cache**: Redis with ACLs, TLS, and isolated VPC deployment for idempotency tokens, rate limiting, and sequence caching.

---

### 2. XRPL Microservice Data Flow

1. **User Initiation**: Client initiates an XRP payment; request is validated and authenticated via JWT.
2. **Consent & Signing**: Transaction object is built and pushed to external wallet; signed transaction is returned over encrypted channel.
3. **Transaction Submission**: Submission Handler transmits signed payload via mTLS.
4. **Ledger Confirmation**: Ledger Listener verifies event signatures before updating Firestore audit logs.
5. **Fallback Activation**: Emergency signing within HSM, limited to predefined anomaly conditions.
6. **Result Notification**: Secure webhook or WebSocket notifies client of outcome.

\--- XRPL Microservice Data Flow

1. **User Initiation**: Client requests an XRP payment via the app.
2. **Consent & Signing**: Service builds the transaction object and sends it to the user’s external wallet for signing.
3. **Transaction Submission**: Signed transaction is routed to the XRP Ledger API.
4. **Ledger Confirmation**: Ledger Listener receives the transaction outcome and updates the Transaction Log.
5. **Fallback Activation**: If wallet provider is unavailable, Direct Ledger Fallback constructs and submits the transaction using emergency service keys.
6. **Result Notification**: Service returns success or failure response to the client application.

---

### 3. Technology Stack

* **XRPL SDK**: `xrpl.js` for direct ledger communications
* **Backend**: Node.js with TypeScript
* **WebSockets**: Native WebSocket or gRPC streams to `rippled`
* **Database**: Firebase Firestore
* **Containerization**: Docker, Kubernetes
* **Security**: Hardware Security Modules (HSM) or KMS for emergency key storage

---

This XRPL Microservice is designed for high reliability and security, ensuring seamless XRP transactions in EpicTask while leveraging user-controlled wallets and providing robust fallback options.

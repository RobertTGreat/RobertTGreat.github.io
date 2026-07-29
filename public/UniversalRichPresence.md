# The Universal Rich Presence (ULP) Standard: Technical Design Paper

**Author:** Pleiades Project Team

**Subject:** Open-Standard Cross-Platform Rich Presence Architecture

---

## 1. Abstract

Rich Presence (RP) technology allows applications to broadcast dynamic user state—such as real-time game activity, current media playback, or active developer environment details—to peer networks. However, current implementations remain heavily locked to proprietary ecosystems, most notably Discord's Rich Presence SDK. This reliance introduces vendor lock-in, single-point-of-failure vulnerabilities, and fragmented protocol adoption across competing chat and social clients.

The Universal Rich Presence (ULP) standard introduces an open, client-agnostic protocol layer designed to decouple application status generation from specific target platforms. By establishing a standardized transport interface and data payload structure, ULP enables software to publish rich context once and broadcast it across multiple desktop tools, messaging networks, and open-source clients simultaneously.

---

## 2. Introduction & Background

### 2.1 The Current State of Rich Presence

Rich Presence was popularized by Discord as a local IPC (Inter-Process Communication) mechanism. Applications integrate proprietary client libraries (such as `discord-rpc` or the Discord Game SDK) to stream JSON payloads over local sockets to a running Discord desktop client. While effective, this architecture relies on a closed ecosystem:

* **Vendor Lock-in:** Developers must integrate platform-specific SDKs.
* **Tightly Coupled Sockets:** Data is emitted specifically to target proprietary pipe endpoints.
* **Privileged Control:** The platform dictates asset management (e.g., uploading image keys to a specific developer portal), field formatting, and rate limits.

### 2.2 The Problem with Ecosystem Monopolies

When presence broadcasting relies entirely on a single platform, alternative clients (such as Revolt, Matrix, Steam, Element, or custom local status displays) are excluded. Users running privacy-focused or open-source alternatives lose out on rich status updates unless developers write and maintain separate bindings for every target client.

---

## 3. The Universal Rich Presence (ULP) Vision

The ULP standard changes the status broadcasting paradigm from a **client-dedicated model** to a **universal local bus model**.

```diagram
                     [ GAME / APP / MEDIA PLAYER ]
                                   │
                                   ▼ (ULP Payload Stream)
                     [ LOCAL ULP IPC DAEMON / BUS ]
                                   │
         ┌─────────────────┬───────┴─────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼
  [ DISCORD CLIENT ] [ REVOLT CLIENT ] [ MATRIX BRIDGE ] [ CUSTOM DISPLAY ]
```

Under ULP, applications interact with a standardized local interface. Any client or background service running on the host system can listen to this presence stream (with proper permissions) and translate it for its target network.

---

## 4. Technical Architecture

### 4.1 Data Structure & Payload Standardization

ULP standardizes presence metadata into structured JSON payloads. This schema covers typical rich presence fields while allowing extensible metadata:

* **Application Identity:** Unique application identifier (`app_id`), display name, and process metadata.
* **State & Details:** Descriptive text representing current activity (e.g., *"In Match - Rank #3"*, *"Editing main.rs"*).
* **Timestamps:** Standard UNIX epoch fields for tracking activity duration (`start_time`, `end_time`).
* **Visual Assets:** Unified URI references for icons and graphics (replacing platform-locked asset keys with standard HTTP/HTTPS URLs or base64 data streams).
* **Party & Match Information:** Structured metadata for multiplayer lobbies, including join/spectate keys and maximum party capacities.

### 4.2 Transport Layer & Discovery

ULP defines clear transport mechanisms for local inter-process communication:

* **Unix Domain Sockets / Windows Named Pipes:** Standardized, low-latency IPC channels hosted at predictable system paths.
* **Local WebSockets / HTTP Fallback:** Enables browser-based apps, web dashboards, and sandboxed environments to broadcast presence metadata easily.

---

## 5. Key Advantages over Legacy Solutions

* **Platform Independence:** Application developers write presence logic once using the ULP standard, eliminating the need to update code when third-party chat platform SDKs break or deprecate APIs.
* **User Privacy & Control:** Users decide which applications are permitted to read presence streams and choose which platforms receive their status updates.
* **Zero Dependency on Web Developer Dashboards:** Asset hosting relies on standardized URIs rather than centralized platform asset dashboards.
* **Multi-Target Dispatch:** A single running application can update status across Discord, Matrix, Mastodon, desktop widgets, and local home automation setups simultaneously.

---

## 6. Implementation Strategy & Roadmap

1. **Core Specification Definition:** Finalize JSON schemas, socket handshake specs, and error handling behaviors within the `pleiades-org/ulp-standard` repository.
2. **Reference SDKs:** Provide lightweight, zero-dependency reference libraries for mainstream languages (Rust, C/C++, Python, JavaScript/TypeScript).
3. **Bridge & Adapter Tooling:** Build backport daemons that translate ULP payloads into legacy Discord RPC calls, ensuring backward compatibility with existing platform clients while mainstream adoption grows.
4. **Community & Client Adoption:** Engage open-source chat client developers and application creators to adopt native ULP listening capabilities.

---

## 7. Conclusion

Preserving dynamic presence data within proprietary silos restricts user choice and increases software maintenance overhead. The Universal Rich Presence (ULP) standard provides an open, vendor-neutral protocol that elevates presence metadata to a core desktop capability. By adopting ULP, developers gain a future-proof presence API, and users regain ownership over their digital status context.
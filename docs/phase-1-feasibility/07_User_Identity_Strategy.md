# User Identity Strategy

## Options

| Approach | Privacy | Persistence | Abuse controls | Support/recovery | Cost/complexity |
|---|---|---|---|---|---|
| Guest-only local storage | Best data minimization | One browser/device; loss on clear/reset | Weak and easy to evade | No recovery burden or capability | Lowest |
| Anonymous server session | Pseudonymous server data | Same browser; server-backed continuity | Practical device/session limits | Limited recovery | Low–moderate |
| Optional account | More personal data | Cross-device and recovery | Stronger user-level controls | Password/OAuth recovery and support | Moderate |
| Required account | Highest collection | Strong | Strong | Highest onboarding and recovery burden | Highest |

## Recommendation

Use an **anonymous server session with local cached trip data** for the MVP.

- Create a random, opaque, rotating session identifier.
- Do not derive identity from browser fingerprinting.
- Store only the minimum trip and usage state required.
- Keep a local cached copy of saved essential trip data.
- Apply per-session and coarse abuse controls without storing precise location history.
- Explain that clearing browser data or changing devices may lose access.

This approach is simpler than accounts but provides better usage controls and server-backed trip behavior than local-only storage.

## Optional accounts

Defer optional accounts until a defined feature requires them, such as:

- Cross-device trip access
- Recovery after device loss
- Explicit long-term trip retention

If introduced, upgrading should attach selected trips to an account only after clear consent. Guest use must remain available for core features. Required accounts are not justified for the MVP.

## Security and privacy requirements

- Use high-entropy opaque identifiers stored in secure, appropriate cookies.
- Rotate identifiers on privilege changes and suspicious activity.
- Apply server-side authorization to every trip.
- Do not put trip or user data in URLs.
- Do not use email, phone, or social identity for anonymous sessions.
- Store rate-limit data separately from analytics where practical.
- Provide a “delete this trip/session” control.
- Do not use invasive fingerprinting to enforce free-use limits.

## Abuse limitations

Anonymous limits are deterrents, not perfect identity. Combine:

- Session/device-cookie quotas
- IP-based coarse rate limits with shared-network tolerance
- Global concurrency and budget controls
- Challenge mechanisms only after suspicious behavior
- Maximum trip, prompt, and response sizes

Avoid penalizing hotel, airport, or café users sharing one network.

## Recovery and support

Guest sessions have no identity-based recovery. Support should not attempt to infer or reveal a trip from IP, itinerary details, or location. Optional accounts, if later approved, need email verification, recovery, deletion, and incident procedures.

## Founder decision

Approve anonymous server sessions as the MVP identity model and accept the tradeoff that guest trips are not reliably recoverable across devices.

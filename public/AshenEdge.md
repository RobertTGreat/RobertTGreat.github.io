# Ashen Edge: Technical Architecture & Systemic Design Manual

---

## Abstract

**Ashen Edge** is a deterministic, dark fantasy single-player directional combat system engineered around spatial mechanics, continuous physical collision verification, and strict input agency. Built to transcend standard soft-locking melee systems, *Ashen Edge* enforces physical fidelity across three directional vectors (**Left**, **Right**, **High**).

This paper defines the end-to-end game design, systemic interactions, mechanical feedback loops, and architectural blueprints necessary to construct an uncompromising melee combat engine.

---

## Section 1: Core Combat Pillars & System Foundations

### 1.1 Core Pillars

1. **High Lethality & Deterministic Execution:** Outcome is governed strictly by spatial positioning, timing, and stamina management. Random number generation (RNG) and artificial target lock-on magnetism are entirely absent.
2. **Directional Stance Geometry:** Offense and defense operate along three directional sectors. Alignment between offensive trajectory and defensive guard dictates hit resolution.
3. **Fluid Momentum Mechanics:** Defensive actions do not reset the state machine; instead, parries, blocks, and clashes store and transfer kinetic energy into counter-offensive branches.

### 1.2 Resource Architecture: Stamina & Poise Mechanics

Combat stability depends on two primary fluid resources: **Stamina** and **Poise (Guard Stability)**.

* **Stamina:** Depleted by initiating attacks, parries, dodges, and absorbing damage through a active guard. Continuous guard retention incurs a linear stamina penalty (**Guard Fatigue**) after 2.5 seconds to prevent passive turtling.
* **Poise:** Represents structural balance and kinetic resistance. Poise is depleted by taking blocked hits or rapidly changing stances. Complete poise depletion forces a **Guard Break** state, leaving the entity open to high-damage execute maneuvers.

---

## Section 2: Spatial Physics & Swept Collision Geometry

Rather than utilizing static bounding boxes or frame-delayed physics colliders—which suffer from tunneling at high velocities—*Ashen Edge* executes spatial collision checks via **Continuous Swept Raycast Arrays**.

---

```
                       ATTACK INITIATION (Active Frames)
                                       │
                                       ▼
                   SWEEP VOLUME GENERATION (Frame N to N-1)
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
 [ ENCOUNTER ENEMY PARRY ]   [ ENCOUNTER ENEMY BODY ]   [ ENCOUNTER ENVIRONMENT ]
            │                          │                          │
            ▼                          ▼                          ▼
  Evaluate Frame Window       Calculate Hit Location     Apply Wall Drag Friction
  - Tier 3: Parry Match       - Tip vs. Shaft Ratio      - Reduce Swing Velocity
  - Tier 2: Block Absorb      - Procedural IK Recoil     - Scale Hit Damage Down

```

---

### 2.1 Swept Raycast Ray-Array Engine

A series of Raycast Anchors are aligned along the physical geometry of the weapon mesh from hilt to tip. During active swing frames, the engine constructs a swept convex volume between the positions of anchors in Frame $N-1$ and Frame $N$.

* **Zero-Tunneling Guarantee:** Sweeping the volume between discrete ticks ensures fast-moving blades cannot bypass defensive zones or body hitboxes regardless of engine framerate.
* **Exact Contact Trametry:** Returns precise world coordinates $(X, Y, Z)$ at the exact point of surface intersection, driving dynamic particle vectors, blade incision marks, and point-specific physical recoil.

### 2.2 Anatomical Hit Resolution (3-Tier Matrix)

When an active weapon sweep intersects an entity, the spatial signal evaluates collision priorities in order:

1. **Tier 3: Precision Parry Signal:**
* **Condition:** Swept array intersects the opponent's active Parry Zone within the tight active frame window (6–8 frames) AND directional angles match within $\pm 45^\circ$.
* **Result:** Rebounds attacker’s weapon, applies hitstop, resets defender recovery, and opens a Riposte Window.


2. **Tier 2: Glancing Block / Absorb Signal:**
* **Condition:** Swept array intersects the Parry Zone outside the parry frame window (holding active guard) OR directional angles do not match precisely.
* **Result:** Attack momentum continues through minor contact. Attacker damage is mitigated by defender Poise; defender incurs Stamina drain scaled by attack weight.


3. **Tier 1: Direct Clean Hit Signal:**
* **Condition:** Swept array intersects the body hurtbox without contacting an active Parry Zone.
* **Result:** Full damage and base poise loss applied; procedural hit-reaction Inverse Kinematics (IK) triggered at the contact vector.



---

## Section 3: Weapon Classifications & Anatomical Mechanics

### 3.1 Sweetspot & Shaft Math

Weapons enforce spatial awareness through radial efficiency zones along the length of the blade or shaft.

$$\text{Damage Multiplier} = \begin{cases}  1.0 & \text{if } d \ge \text{Sweetspot Threshold} \\ 0.35 & \text{if } d < \text{Sweetspot Threshold (Shaft Impact)}  \end{cases}$$

Where $d$ is the normalized impact distance ($0.0 = \text{Hilt}$, $1.0 = \text{Tip}$).

---

### 3.2 Asymmetric Weapon Specs

| Weapon Class | Reach Range | Parry Sector Angle | Sweetspot Zone | Shaft/Dead-Zone Penalty |
| --- | --- | --- | --- | --- |
| **Dagger** | 0.6 meters | $30^\circ$ (Compact) | Full Blade ($0.0 - 1.0$) | None |
| **Longsword** | 1.4 meters | $110^\circ$ (Balanced) | Outer $60\%$ ($0.4 - 1.0$) | Inner $40\%$ ($-25\%$ Damage) |
| **Halberd** | 2.2 meters | $50^\circ$ (Deep Forward) | Axe Head ($0.75 - 1.0$) | Shaft ($0.0 - 0.74$) ($-65\%$ Damage) |
| **Greatsword** | 2.0 meters | $140^\circ$ (Massive) | Outer $75\%$ ($0.25 - 1.0$) | Inner $25\%$ (Guard Lockout) |

---

### 3.3 Dynamic Environment Drag & Friction

When swept raycasts intersect static environmental geometry (walls, pillars, low ceilings), the attack does not prematurely ricochet into a hard bounce stun. Instead, the blade enters **Kinetic Friction**:

* **Velocity Depletion:** Swing velocity drops proportionally to the depth and mass of the geometry collided with ($40\text{--}70\%$ speed reduction).
* **Scaled Impact Payload:** Output damage and poise depletion scale down dynamically based on remaining kinetic velocity upon reaching an enemy hurtbox.
* **Corridor Constraints:** Encourages tactical weapon selection; thrusting weapons and short blades retain full efficiency indoors, whereas heavy sweeping weapons suffer severe damage degradation.

---

## Section 4: Advanced Combat Mechanics & Input Pipeline

### 4.1 Mass-Based Clashing vs. Binding Engine

When two active weapon swept arrays collide on the same frame, the engine calculates the **Mass & Strength Ratio**:

$$\text{Leverage Ratio} = \frac{\text{Mass}_{\text{Attacker A}} \times \text{Strength}_{\text{Attacker A}}}{\text{Mass}_{\text{Attacker B}} \times \text{Strength}_{\text{Attacker B}}}$$

#### State Outcomes:

* **Equal Matchup ($\text{Ratio} \le 1.25$) — The Clash State:**
* Both weapons emit spark particle arrays and apply a mutual 15% Poise drain.
* Both entities enter a short 6-frame recoil state, cancelable into immediate evasive or defensive actions.


* **Unequal Matchup ($\text{Ratio} > 1.25$) — The Bind State (2–4 Seconds):**
* The heavier weapon overpowers the lighter blade, locking both weapons at the contact point.
* Initiates a dynamic tug-of-war leverage state. The defender must mash primary attack inputs to resist, or execute a blade-slide morph (taking minor chip damage) to slip the leverage and step-thrust to the flank.



---

### 4.2 Morphing, Soft-Cancels, & Phantom Parry Prevention

To allow psychological feints without introducing phantom parry vulnerabilities, attack animations are structured into strict lifecycle frames:

```
[ Phase 1: Morph / Feint Window ] ──► [ Phase 2: Point of No Return ] ──► [ Phase 3: Active Swing ]
  (0% to 45% Windup Duration)           (46% to 59% Windup Duration)        (60% to 100% Active)
  - Morphing permitted                  - Attack animation committed       - Swept raycasts ACTIVE
  - Directional guard switch allowed    - Telegraph visuals locked         - Signals emit on contact

```

#### Prevention of Phantom Parries:

If an attacker soft-cancels a High Heavy strike into a Low Right strike while the defender attempts a High Parry:

1. The attacker's High Heavy threat payload is flushed cleanly before active collision frames begin.
2. The defender's High Parry box remains physically tied to the High sector for its remaining duration.
3. The attacker's Low Right strike enters Phase 3, sweeping through the defender's open torso.
4. Because defensive resolutions are strictly spatial rather than animation-locked, the defender takes a clean, unmitigated hit without triggering a phantom parried state.

---

### 4.3 Attribute-Scaled Stance Switching

To eliminate guard-spamming while rewarding high-attribute builds, shifting directional stances incurs a immediate **Poise Cost**.

$$\text{Effective Poise Cost} = \text{Base Cost} \times \left( \frac{1}{1 + (\text{Strength} \times 0.02 + \text{Agility} \times 0.03)} \right)$$

* **Spam Punishment:** Rapidly shifting guard directions drains the player's poise bar. Sustaining hits with depleted poise causes an immediate **Guard Break Stagger**.
* **High-Agility Scaling:** Players with high Agility and Strength stats can shift stances rapidly for lower costs, allowing fluid combo morphs and feints.

---

### 4.4 360° Multi-Target Geometry & Blind-Spot Guarding

* **Target-Locked Movement:** Stance inputs map relative to the primary locked target's spatial axis. Killing a target automatically snaps focus to the nearest hostile within view.
* **Unlocked / Off-Screen Guarding:** When an enemy strikes from outside the front view cone (from behind or the flank), holding the corresponding stance direction (**High** for overheads, **Left/Right** for side strikes) tilts the character's weapon back across their shoulders.
* **Physics Sector Sweep:** The rear parry sector activates, converting an un-targeted backstab into a high-stamina block (1.5x Stamina Multiplier) and maintaining combat flow when outnumbered.

---

## Section 5: Structural Pitfall Mitigations

---

```
                       HARDWARE INPUT RECEIVED
                                  │
                                  ▼
                    [ System in Hitstop Freeze? ]
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
               [ YES ]                           [ NO ]
                 │                                 │
                 ▼                                 ▼
   Store in Priority Queue               Pass to Motion Engine
   (Raw Hardware Engine Time)            - Instant execution
                 │
                 ▼ (Hitstop Expires)
   Flush Highest Priority Action

```

---

### 5.1 Priority Queue Input Buffer

* **Problem:** Frames of freeze-time (**Hitstop**) on heavy hits can drop button inputs queued during impact.
* **Mitigation:** Inputs register into a priority ring-buffer evaluated on **raw hardware engine time** (unscaled). When hitstop expires, the highest priority queued action (**Parry > Dodge > Morph > Attack**) flushes on Frame 0.

### 5.2 Passive Turtling & Structural Guard Creep

* **Problem:** Highly defensive players can hold static block states indefinitely.
* **Mitigation 1 (Guard Fatigue):** Holding guard continuously past 2.5 seconds drains stamina linearly over time.
* **Mitigation 2 (Poise Bleed):** Fully charged heavy attacks deal 20% poise damage directly through active blocks, forcing defensive players to dodge or counter.

### 5.3 Procedural Hit-Reaction IK

* **Problem:** Raycast collisions feel disconnected if played alongside generic hit animations.
* **Mitigation:** When a hit resolves, the contact point $(X, Y, Z)$ and impact velocity vector are sent to the target's Inverse Kinematics (IK) system. The skeleton applies a momentary physical recoil (100–150ms) centered at the hit location before blending into the standard hit-stun state.

### 5.4 Root Motion Directional Friction

* **Problem:** High camera sensitivity during manual targeting can cause heavy attack sweeps to swing wildly off-target.
* **Mitigation:** On attack initiation (Phase 2), the system clamps character torso orientation along its starting direction vector, keeping heavy swing momentum grounded along its intended path.

---

## Section 6: Hitstop & Frame Pacing Math

To convey structural weight without causing input delay or desynchronization:

### 6.1 Hitstop Calculation Formula

Upon hit validation, character animation updates pause for a set number of frames while physics updates continue:

$$N_{\text{frames}} = \text{BaseFrames} + (\text{WeaponMass} \times \text{ImpactVelocityMultiplier})$$

* **Light Hit (Dagger):** 2 frames (~33ms)
* **Medium Block (Longsword):** 4 frames (~66ms)
* **Heavy Parry / Greatsword Hit:** 8–10 frames (~133–166ms)

### 6.2 Vector-Aligned Impulse Camera Displacement

Camera offset occurs along the **impact normal vector** of the swing:

* **Overhead Strike:** Vertical downward displacement with a spring-back recovery.
* **Horizontal Slash:** Lateral screen-shift along the strike direction.

---

## Section 7: Modular Netcode Architecture (Theoretical Foundation)

While *Ashen Edge* is built as a single-player engine, its system bus decouples rendering from physical logic to support future netcode integration.

```
                           CLIENT HARDWARE INPUT
                                     │
                                     ▼
                      PREDICTIVE LOCAL RAYCAST SWEEP
                                     │
                  ┌──────────────────┴──────────────────┐
                  ▼                                     ▼
      [ SINGLEPLAYER ROUTE ]                [ THEORETICAL NETCODE ROUTE ]
      - Direct Hitstop Execution            - Timestamp Payload Serialized
      - Local IK Recoil Application         - Server Rewind (Tick minus Latency)
      - Instant State Resolution            - Snapshot Reconciliation Pass

```

### Decoupled State Messaging

All combat signals pass as immutable data structures containing spatial vectors, frame ticks, and stance states:

```
STRUCT CombatStateSnapshot:
    Field FrameTick        : Unsigned 32-bit Integer
    Field EntityID         : 64-bit UUID
    Field PositionVector   : Vector3 (X, Y, Z Coordinates)
    Field WeaponTipVector  : Vector3 (X, Y, Z Coordinates)
    Field ActiveStance     : 8-bit Integer (0: Left, 1: Right, 2: High)
    Field CurrentPoise     : Single Precision Float
END STRUCT

```

By processing combat through explicit state snapshots and swept arrays, server authority can perform **Lag Compensation Rewinds** ($T - \text{Latency}$) without modifying core single-player mechanics.

---

## Conclusion

The architecture of *Ashen Edge* combines physical precision, strict directional geometry, and deterministic signal processing into a deep combat framework. By removing arbitrary input delays, replacing traditional physics colliders with swept raycast arrays, and scaling stamina and poise costs through physical attributes, the engine delivers high mechanical feedback and unyielding player agency.
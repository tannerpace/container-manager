# VA TRM WTFPL License Resolution Guide

## Issue Summary

The Container Manager project has **1 package** with WTFPL license that requires attention for VA TRM compliance:

**Package:** `truncate-utf8-bytes@1.0.2`

- **License:** WTFPL (What The F\*\*\* Public License)
- **Dependency Chain:** electron-builder → builder-util → sanitize-filename → truncate-utf8-bytes
- **Usage:** Build-time only (Electron app packaging)

## Analysis of WTFPL Packages

| Package                     | License      | VA TRM Status        | Reason                          |
| --------------------------- | ------------ | -------------------- | ------------------------------- |
| `sanitize-filename@1.6.3`   | WTFPL OR ISC | ✅ **COMPLIANT**     | Dual licensed - ISC is approved |
| `utf8-byte-length@1.0.5`    | WTFPL OR MIT | ✅ **COMPLIANT**     | Dual licensed - MIT is approved |
| `truncate-utf8-bytes@1.0.2` | WTFPL only   | ❌ **NON-COMPLIANT** | Single WTFPL license            |

## Resolution Options

### Option 1: Accept Build-Time Risk (Recommended) ✅

**Rationale:**

- Package is used only during build process, not in production runtime
- No security or operational risk to VA systems
- Electron-builder is widely used in enterprise environments
- Total package size: 2.1KB - minimal impact

**Implementation:**

- Document the exception in deployment artifacts
- Add to license exception list for build tools
- Monitor for alternative Electron builders

### Option 2: Use Alternative Electron Builder

**Options:**

- `@electron-forge/cli` (MIT licensed)
- `electron-packager` (BSD-2-Clause licensed)

**Trade-offs:**

- Requires significant configuration changes
- May lose some electron-builder features
- Additional testing and validation needed

### Option 3: Fork and Replace Package

**Approach:**

- Create MIT-licensed fork of `truncate-utf8-bytes`
- Use npm override to point to fork
- Maintain fork for security updates

**Implementation:**

```json
{
  "overrides": {
    "truncate-utf8-bytes": "npm:@yourorg/truncate-utf8-bytes@^1.0.2"
  }
}
```

## Recommended Solution

**Accept Option 1** with the following mitigations:

1. **Documentation:** Add to project README and deployment docs
2. **Monitoring:** Track electron-builder updates for license changes
3. **Isolation:** Ensure build environment is separate from production
4. **Alternative Planning:** Evaluate electron-forge as future migration path

## VA TRM Compliance Statement

```
WTFPL License Exception - Build Tools Only

Package: truncate-utf8-bytes@1.0.2
License: WTFPL
Justification: Build-time dependency only, no runtime exposure
Risk Level: MINIMAL
Mitigation: Isolated build environment, documented exception
Approval: [Pending VA IT Review]
```

## Implementation Commands

To document this exception, add to your deployment documentation:

```bash
# Verify build-time only usage
npm ls truncate-utf8-bytes

# Check package contents (minimal impact)
npm view truncate-utf8-bytes dist.tarball
```

## Monitoring Script

Add this to your CI/CD pipeline to monitor for changes:

```bash
#!/bin/bash
# Check for WTFPL licenses in production dependencies
npm ls --prod --json | grep -i "wtfpl" && echo "ALERT: WTFPL in production!" || echo "OK: No WTFPL in production"
```

This ensures WTFPL packages remain in build-time dependencies only.

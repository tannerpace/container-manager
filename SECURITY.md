
## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | ✅ Yes             |

---

## Security Overview

Container Manager is intended for **local development only**. It connects to the Docker Engine API without authentication for ease of use. **Do not use this configuration in production.**

### ⚠️ Docker API Access

- The Docker daemon is exposed **without authentication** (typically on `localhost:2375`).
- **Never** expose this port to external or untrusted networks.
- Anyone with access to this port can control your Docker daemon and containers.
- This setup is for **trusted, local development environments only**.

### Data Handling

- Sensitive environment variables are masked in the UI by default.
- Clipboard operations involving sensitive data are only logged in development mode.
- No persistent storage of sensitive container data is used by this application.

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue.
2. Email the maintainer directly (see repository owner).
3. Include as much detail as possible.
4. Please allow time for a fix before public disclosure.

---

## Best Practices for Users

- Use only in trusted, local development environments.
- **Never** expose Docker API (`localhost:2375`) to the internet or external networks.
- Regularly update Docker and this application.
- Review environment variables before sharing screenshots or logs.
- Use Docker authentication and TLS in production environments.
- Remove or disable this application when not in use.

---

## Additional Recommendations

- Consider using a firewall to restrict access to the Docker API port.
- Monitor your Docker daemon for unexpected activity.
- Always follow Docker’s own [security best practices](https://docs.docker.com/engine/security/).

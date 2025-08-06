
## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Security Considerations

### Docker API Access

This application connects to Docker API without authentication for development convenience. This configuration:

- ⚠️ Exposes Docker daemon without authentication
- ⚠️ Should **NEVER** be used in production environments
- ⚠️ Could allow unauthorized access to your Docker daemon
- ✅ Is intended for local development only

### Data Handling

- Environment variables marked as potentially sensitive are masked by default
- Clipboard operations involving sensitive data are logged only in development mode
- No persistent storage of sensitive container data

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly
3. Include detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Best Practices for Users

1. Only use this application in trusted development environments
2. Never expose Docker API (port 2375) to external networks
3. Regularly update Docker and this application
4. Review container environment variables before sharing screenshots
5. Use proper Docker authentication in production environments

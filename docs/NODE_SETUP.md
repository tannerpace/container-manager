# Node.js Setup for Oh My Zsh Users

This project is configured to work seamlessly with Oh My Zsh and NVM.

## Quick Setup

1. **Ensure NVM plugin is enabled in Oh My Zsh**:

   ```bash
   # Add 'nvm' to your plugins in ~/.zshrc
   plugins=(... nvm)
   ```

2. **Use the correct Node.js version**:

   ```bash
   nvm use
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Run the environment check** (optional):
   ```bash
   ./scripts/setup-node.sh
   ```

## VS Code Integration

The project is configured to use whatever Node.js version is active in your terminal, so:

1. Open a new terminal in VS Code
2. Run `nvm use` to ensure the correct Node.js version
3. Restart the ESLint server if needed: `Cmd+Shift+P` → "ESLint: Restart ESLint Server"

## Troubleshooting

- **ESLint not working**: Restart VS Code after running `nvm use`
- **Wrong Node.js version**: Run `nvm use` in the VS Code terminal
- **Extensions not working**: Make sure the NVM plugin is properly configured in Oh My Zsh

The configuration avoids hardcoded paths and works with your existing shell setup.

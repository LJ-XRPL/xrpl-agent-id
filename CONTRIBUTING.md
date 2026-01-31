# Contributing to XRPL Agent Identity Registry

Thank you for your interest in contributing to the XRPL Agent Identity Registry! This project aims to create a robust, automated verification system for AI agents using XRPL blockchain technology.

## 🎯 Project Vision

We're building a **fully automated** identity verification system where:
- AI agents can prove their authenticity without human gatekeepers
- Verification is cryptographically sound and on-chain verifiable
- The system resists gaming through sophisticated behavioral analysis
- Trust levels are progressive (Basic → Attested → Audited)

## 🚀 Getting Started

### Development Environment Setup

1. **Prerequisites**
   - Node.js 18+ and npm
   - Git
   - VS Code or your preferred editor
   - XRPL testnet account for testing

2. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/xrpl-agent-identity-registry.git
   cd xrpl-agent-identity-registry
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your XRPL testnet credentials
   ```

5. **Initialize Database**
   ```bash
   npm run db:init
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

### Code Style and Quality

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint + Prettier**: Enforced on commit
- **Tailwind CSS**: For styling (utility-first)
- **Component Structure**: Functional components with TypeScript
- **Testing**: Jest for unit tests, Playwright for E2E (coming soon)

## 🏗️ Architecture Overview

### Core Modules

```
src/
├── lib/                 # Core business logic
│   ├── types.ts        # TypeScript interfaces and types
│   ├── db.ts           # SQLite database operations
│   ├── xrpl.ts         # XRPL blockchain interactions
│   ├── did.ts          # W3C DID document management
│   ├── credentials.ts  # XRPL credential operations
│   ├── challenge.ts    # Challenge-response system
│   └── verification.ts # Verification orchestration
├── components/         # Reusable React components
├── app/               # Next.js App Router pages
│   ├── register/      # Agent registration flow
│   ├── directory/     # Agent directory/search
│   ├── verify/        # Agent verification
│   ├── agent/         # Individual agent profiles
│   └── monitor/       # System analytics
└── scripts/           # Utility scripts
```

### Key Design Principles

1. **Automation First**: No manual approval processes
2. **Cryptographic Verification**: All trust relationships verifiable on-chain
3. **Progressive Trust**: Three-tier system with increasing verification rigor
4. **Anti-Gaming**: Sophisticated behavioral analysis prevents gaming
5. **Open Source**: Transparent, auditable, forkable

## 🤝 How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
- Use GitHub Issues with the "bug" label
- Include steps to reproduce, expected vs actual behavior
- Provide environment details (OS, browser, Node.js version)
- Screenshots/logs if applicable

#### ✨ Feature Requests
- Use GitHub Issues with the "enhancement" label
- Describe the problem and proposed solution
- Consider impact on automation and security
- Align with project vision

#### 🔧 Code Contributions
- Fork the repository and create a feature branch
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Submit a pull request with clear description

#### 📖 Documentation
- API documentation improvements
- Integration guides and tutorials
- Code comments and inline documentation
- README and setup instructions

### Priority Areas for Contribution

#### High Priority
1. **TEE Integration Expansion**
   - Intel SGX attestation verification
   - AWS Nitro Enclaves support
   - ARM TrustZone integration
   - Azure Confidential Computing

2. **Behavioral Analysis Enhancement**
   - New challenge types resistant to gaming
   - Improved latency profiling algorithms
   - Advanced statistical analysis
   - Drift detection refinements

3. **Security Hardening**
   - Challenge signature verification
   - Rate limiting and DoS protection
   - Input validation and sanitization
   - Cryptographic best practices

#### Medium Priority
1. **User Experience**
   - Registration wizard improvements
   - Real-time verification progress
   - Better error handling and messages
   - Mobile-responsive design

2. **Performance Optimization**
   - Database query optimization
   - XRPL connection pooling
   - Caching strategies
   - Bundle size optimization

3. **Developer Experience**
   - API client libraries
   - Agent callback examples
   - Integration testing tools
   - Development tools

#### Lower Priority
1. **Analytics and Monitoring**
   - Advanced metrics dashboard
   - Alerting and notifications
   - Log aggregation
   - Performance monitoring

2. **Ecosystem Integration**
   - Multi-issuer federation
   - Cross-chain bridges
   - Third-party service integrations
   - Webhook support

### Pull Request Process

1. **Branch Naming**
   - `feature/description-of-feature`
   - `bugfix/description-of-bug`
   - `docs/description-of-change`

2. **Commit Messages**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
   - Clear, descriptive messages
   - Reference issues when applicable

3. **Code Quality Checks**
   ```bash
   npm run lint        # ESLint check
   npm run type-check  # TypeScript validation
   npm run build       # Build verification
   ```

4. **Pull Request Template**
   - Clear title and description
   - Link to related issues
   - Test plan and verification steps
   - Screenshots for UI changes
   - Breaking change notes

5. **Review Process**
   - All PRs require at least one review
   - Address feedback promptly
   - Keep PRs focused and atomic
   - Update documentation as needed

## 🧪 Testing Guidelines

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- challenge.test.ts

# Run tests in watch mode
npm test -- --watch
```

### Integration Tests
```bash
# Test XRPL connection
npm run test:xrpl

# Test database operations
npm run test:db
```

### Manual Testing Checklist
- [ ] Agent registration flow works end-to-end
- [ ] Challenge-response system functions correctly
- [ ] DID documents are properly created and stored
- [ ] Credentials are issued and verifiable on-chain
- [ ] UI is responsive and accessible

## 🔒 Security Considerations

### Threat Model
1. **Gaming Prevention**: Sophisticated bots trying to pass verification
2. **DoS Attacks**: Overwhelming the system with fake registrations
3. **Credential Forgery**: Attempting to create fake credentials
4. **Behavioral Mimicry**: Human actors trying to mimic AI patterns

### Security Best Practices
- Always validate input from external sources
- Use cryptographic signatures for challenge verification
- Implement rate limiting on API endpoints
- Sanitize data before database storage
- Follow OWASP security guidelines

### Vulnerability Reporting
For security vulnerabilities, please email security@xrpl-agent-registry.com rather than creating public issues.

## 📋 Code Review Checklist

### General
- [ ] Code follows established patterns and conventions
- [ ] No secrets or sensitive data committed
- [ ] Error handling is appropriate and informative
- [ ] Comments explain complex logic

### TypeScript
- [ ] Strict typing, no `any` types
- [ ] Interfaces properly defined
- [ ] Null/undefined handling
- [ ] Async/await used correctly

### React/Next.js
- [ ] Components are properly typed
- [ ] No unnecessary re-renders
- [ ] Accessibility attributes included
- [ ] Loading and error states handled

### Database
- [ ] Prepared statements for SQL queries
- [ ] Proper indexing for performance
- [ ] Transaction handling where needed
- [ ] Data validation before storage

### XRPL
- [ ] Proper error handling for network calls
- [ ] Transaction signing security
- [ ] Account validation
- [ ] Testnet vs mainnet considerations

## 🎨 Design Guidelines

### UI/UX Principles
- **Clarity**: Clear information hierarchy and flow
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and responsive
- **Trust**: Visual cues for verification status

### Visual Design
- Use XRPL brand colors (blue #0070f3, green #00d4aa)
- Consistent spacing and typography
- Clear status indicators and badges
- Professional, technical aesthetic

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributor list
- GitHub contributor graphs
- Project documentation
- Community showcases

Significant contributors may be invited to join the core team.

## ❓ Questions?

- **GitHub Discussions**: General questions and brainstorming
- **Issues**: Bug reports and feature requests
- **Discord**: Real-time chat in #agent-identity channel
- **Email**: core-team@xrpl-agent-registry.com

Thank you for contributing to the future of AI agent verification! 🚀
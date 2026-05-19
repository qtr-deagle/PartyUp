# PartyUp Platform - Entry Point Diagram

```mermaid
flowchart TD
    Start(["🚀 PartyUp Platform"]) --> Platform{"Platform?"}
    
    Platform -- 📱 Mobile --> Mobile["👥 Travelers Only"]
    Platform -- 🌐 Website --> Landing["📥 Landing Page<br/>Download the App<br/>(Staff/Admin Login Hidden)"]
    
    Mobile --> MobileEnd(["Mobile App"])
    Landing --> Web{"User Type?"}
    
    Web -- 👤 Traveler --> Traveler["Traveler Features<br/>(On Mobile)"]
    Web -- 👨‍💼 Staff --> Auth["🔒 Staff Login"]
    Web -- 👨‍💼 Admin --> Auth2["🔒 Admin Login"]
    
    Traveler --> TEnd(["Redirect to Mobile"])
    Auth --> Staff["Staff Dashboard"]
    Auth2 --> Admin["Admin Dashboard"]
    
    Staff --> WebEnd(["Website"])
    Admin --> WebEnd
    
    style Start fill:#2196f3,color:#fff,stroke:#1565c0,stroke-width:2px
    style Platform fill:#64b5f6,color:#fff,stroke:#1976d2,stroke-width:2px
    style Web fill:#64b5f6,color:#fff,stroke:#1976d2,stroke-width:2px
    style Mobile fill:#81c784,color:#fff,stroke:#388e3c,stroke-width:2px
    style Staff fill:#ffb74d,color:#000,stroke:#f57c00,stroke-width:2px
    style Admin fill:#ba68c8,color:#fff,stroke:#7b1fa2,stroke-width:2px
    style MobileEnd fill:#2e7d32,color:#fff,stroke:#1b5e20,stroke-width:2px
    style WebEnd fill:#4a148c,color:#fff,stroke:#880e4f,stroke-width:2px
```

## Entry Flow Structure

**Platform Detection:**
1. User enters PartyUp
2. Choose platform: Mobile or Website

**Mobile Path:**
- Direct to Travelers only
- No role selection needed

**Website Path:**
- Ask for User's Role
- Route to Staff Dashboard (moderators)
- Route to Admin Dashboard (system managers)

---

## Quick Reference
- **Mobile:** Travelers → Mobile App
- **Website:** Staff → Staff Dashboard Website
- **Website:** Admin → Admin Dashboard Website

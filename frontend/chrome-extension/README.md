# Ahadu Tech Academy — Chrome Extension

A lightweight Chrome Manifest V3 companion for the existing Ahadu Tech Academy website.

## Phase 1 features

- Toolbar popup with Ahadu Tech Academy branding.
- One-click launch of the full academy in a new tab.
- Quick links to the existing dashboard, university, elementary, high-school, coding, and sign-in routes.
- Uses the existing website and backend; it does not create a second account system.
- Does not read, copy, or store passwords, JWTs, cookies, or other authentication secrets.
- No broad browser permissions, content scripts, remote scripts, or background polling.

## Local installation for development

1. Download or clone this repository and open the `frontend/chrome-extension` folder.
2. In Chrome, open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the `chrome-extension` folder.
5. Pin **Ahadu Tech Academy** to the toolbar and click it to test the popup.
6. Test each shortcut and confirm it opens the expected route on the academy website.

## Configuration

The production website origin is currently set in `popup.js` and the footer in `popup.html`:

`https://ahadu-tech-academys.vercel.app`

Update both locations together if the production domain changes.

## Security and privacy

The extension only opens fixed, same-origin academy routes. It does not call the backend directly and does not request access to browsing history, all tabs, page contents, cookies, or local storage. Authentication, role checks, course permissions, and Premium approvals remain the responsibility of the existing academy website and backend.

## Release

This repository folder is the unpacked extension source. A ZIP package and Chrome Web Store listing are separate release tasks and should be prepared after local Chrome testing and review.

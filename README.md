> [!NOTE]
> This Project Is Still In Development. Please Expect Some Bugs Whilst Using It.

### Made With:
[![icons](https://skillicons.dev/icons?i=js,html,css,)](github.com/kixnbt/kix_)

This extension is a project for testing Javascript & Chrome API execution for Chromium browsers

The extension contains the following permissions


| Permissions | Reason |
| --- | --- |
| Native Messaging | Communicates directly with external programs installed on your computer's operating system, extending access beyond the browser sandbox. |
| Debugger | Exposes Chrome's remote debugging protocol, letting an extension inspect, modify, and capture data across tabs and bypass certain security boundaries. |
| Cookies | Lets an extension read and modify cookies across permitted domains, which attackers can use to hijack logged-in accounts. |
| Proxy | Controls your browser's proxy settings, allowing an extension to reroute and intercept all your internet traffic. |
| WebRequest | Monitors, blocks, or modifies network requests in real time as data travels between your browser and websites. |
| Scripting | Allows an extension to inject and execute JavaScript code inside web pages (when paired with host permissions). |
| **High Severity** | Anything Below This Is **High Severity** |
| ClipboardRead | Continuously reads whatever text or sensitive data (like passwords or crypto keys) you copy to your clipboard. |
| ContentSettings | Changes site-level permissions for cookies, JavaScript, camera, microphone, and location access. |
| History | Reads, modifies, or deletes your complete browsing history across all signed-in devices. |
| Tabs | Exposes the URLs, titles, and favicons of every tab you open. |
| WebNavigation | Tracks every link you click and page transition you make in real time. |
| FileSystemProvider / FileBrowserHandler | Allows access to read or interact with local files via Chrome's file handling APIs. |
| Geolocation | Allows the extension to watch your location without permission from the user |
| Downloads | Reads the download history without asking for permission |
| **Meduim Severity**| Anything Below This Is **Meduim Severity** |
| Identity / Identity.Email | Allows an malicious actor to steal OAuth sessions to your Email and other stuff |
| BrowsingData | Allows an extension to clear your browsing history, cache, cookies, and saved form data. |
| Bookmarks | Reads, creates, edits, and deletes your saved bookmarks.|
| TopSites | Reads the list of websites you visit most frequently. |
| ClipboardWrite| Lets an extension overwrite or copy text to your clipboard (which could swap copied links or wallet addresses). |
| ActiveTab | Grants temporary host access only to the currently open tab and only after you explicitly click or invoke the extension. | 
| Favicon | Reads the website icons of pages you visit. | 
| **Low Severity** | Anything Below This Is **Low Severity** |
| Notifications | Displays desktop notifications from the extension. |
| ContextMenus | Adds custom options to your browser's right-click menu. |
| FontSettings | Manages your browser's font preferences. |
| Storage / UnlimitedStorage | Saves the extension's own local settings and data inside the browser. |
| Alarms | Schedules background tasks to run at specific times. |
| Idle | Detects when your computer screen is locked or inactive. |
| GCM | Enables push messaging between the extension and its server.|
| **Other** | **Other** Permissions Used By Enterprises |
| Enterprise.NetworkingAttributes / Enterprise.PlatformKeys / CertificateProvider / LoginState | Specialized enterprise or ChromeOS device-management APIs controlled by IT administrators. |

> [!CAUTION]
> Our Extension Uses All Permissions Except For **Other** Please User Under Your Own Discretion.

Without these permissions our extension wouldn't work under **Normal Circumstances** we recommend using **Developer Mode** for loading it in unpacked inside `chrome://extensions`.

Our goals with **Kix** is to create an Chrome Extension that acts like an Executor for the user to have more control over their Chromium browser. The extension currently has implemented inside of it:

- An Executor For JavaScript and ChromeAPI
- A better Devtools (In progress)

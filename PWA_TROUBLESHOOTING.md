# PWA Installation Troubleshooting Guide

## 🔍 Why the Install Button Might Not Be Visible

The PWA install button requires several criteria to be met before it can appear. Here's how to troubleshoot:

## 📋 PWA Requirements Checklist

### ✅ Basic Requirements:
- [ ] **HTTPS Connection**: App must be served over HTTPS (except localhost)
- [ ] **Valid Manifest**: Web app manifest must be properly configured
- [ ] **Service Worker**: Service worker must be registered
- [ ] **User Engagement**: User must interact with the site for at least 30 seconds
- [ ] **Not Already Installed**: App must not already be installed

### 📱 Browser Support:
- [ ] **Chrome/Edge**: Full PWA support
- [ ] **Safari**: Limited PWA support (iOS 11.3+)
- [ ] **Firefox**: Full PWA support
- [ ] **Samsung Internet**: Full PWA support

## 🛠️ Debugging Steps

### 1. Check Browser Console
Open Developer Tools (F12) and look for:
```
PWA Support Check: { hasServiceWorker: true, hasBeforeInstallPrompt: true, hasManifest: true }
PWA Installation Check: { isStandalone: false, isIOSStandalone: false }
Can Show Install Prompt: { hasPrompt: true, notInstalled: true, hasBasicSupport: true, result: true }
```

### 2. Check Debug Info in Settings
1. Go to Settings → App Installation
2. Expand "Debug Info" section
3. Look for any `false` values that might prevent installation

### 3. Verify HTTPS
- **Development**: `localhost` works for testing
- **Production**: Must use HTTPS
- **Check URL**: Should start with `https://` or `http://localhost`

### 4. Test User Engagement
- **Wait 30 seconds**: Interact with the app for at least 30 seconds
- **Refresh page**: Try refreshing after some interaction
- **Navigate between tabs**: Switch between Stack, Practice, Stats tabs

## 🚀 Quick Fixes

### Fix 1: Force Install Prompt (Development)
Add this to browser console:
```javascript
// Trigger beforeinstallprompt manually (for testing)
window.dispatchEvent(new Event('beforeinstallprompt'));
```

### Fix 2: Clear Browser Data
1. Clear browser cache and cookies
2. Clear site data for your domain
3. Refresh the page

### Fix 3: Check Browser Settings
1. **Chrome**: Settings → Privacy and security → Site Settings → Install apps
2. **Edge**: Settings → Cookies and site permissions → Install apps
3. **Firefox**: Settings → Privacy & Security → Permissions → Install apps

### Fix 4: Test on Different Browser
Try installing on:
- Chrome (Android)
- Edge (Android)
- Safari (iOS)
- Firefox (Android)

## 📱 Platform-Specific Instructions

### Android (Chrome/Edge):
1. Open app in Chrome/Edge
2. Look for install banner at bottom
3. Or tap menu (⋮) → "Install app"
4. Or go to Settings → App Installation → "📱 Install App"

### iPhone (Safari):
1. Open app in Safari
2. Tap Share button (square with arrow)
3. Scroll down to "Add to Home Screen"
4. Tap "Add"

### Desktop (Chrome/Edge):
1. Look for install icon in address bar
2. Or go to Settings → App Installation → "📱 Install App"

## 🔧 Development Testing

### Local Development:
```bash
# Start development server
npm run dev

# Build for production testing
npm run build
npm run preview
```

### Production Testing:
1. Deploy to HTTPS server
2. Test on actual mobile device
3. Check browser console for errors

## 🐛 Common Issues & Solutions

### Issue: "App installation not available"
**Solution**: 
- Check if you're using HTTPS
- Verify manifest.json is accessible
- Check browser console for errors

### Issue: Install button appears but doesn't work
**Solution**:
- Check if app is already installed
- Clear browser cache
- Try different browser

### Issue: No install prompt on mobile
**Solution**:
- Wait 30 seconds after page load
- Interact with the app (click buttons, navigate)
- Check if browser supports PWA

### Issue: App installs but doesn't work offline
**Solution**:
- Check service worker registration
- Verify caching strategy
- Test with network disconnected

## 📊 Debug Information

The app now includes detailed debug information in Settings → App Installation. Look for:

```json
{
  "installed": false,
  "installable": true,
  "hasPrompt": true,
  "canShow": true,
  "userAgent": "Mozilla/5.0...",
  "isOnline": true
}
```

## 🎯 Expected Behavior

### When Install Button Should Appear:
- ✅ HTTPS connection (or localhost)
- ✅ Valid manifest.json
- ✅ Service worker registered
- ✅ User engaged for 30+ seconds
- ✅ App not already installed
- ✅ Supported browser

### When Install Button Won't Appear:
- ❌ HTTP connection (except localhost)
- ❌ Missing or invalid manifest
- ❌ No service worker
- ❌ App already installed
- ❌ Unsupported browser
- ❌ User hasn't engaged enough

## 📞 Still Having Issues?

If the install button still doesn't appear:

1. **Check the debug info** in Settings → App Installation
2. **Share the debug output** with the console logs
3. **Test on different device/browser**
4. **Verify HTTPS deployment** for production

The app is designed to work on all modern browsers and devices that support PWA features! 
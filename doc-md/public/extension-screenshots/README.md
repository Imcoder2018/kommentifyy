# Extension Screenshots

This folder contains screenshots for each extension tab. When a screenshot exists for a tab, the live preview will display the screenshot instead of the rendered component.

## Folder Structure

```
extension-screenshots/
├── dashboard/
│   └── screenshot.png    <- Dashboard tab screenshot
├── writer/
│   └── screenshot.png    <- Writer tab screenshot
├── automation/
│   └── screenshot.png    <- Automation tab screenshot
├── network/
│   └── screenshot.png    <- Network tab screenshot
├── import/
│   └── screenshot.png    <- Import tab screenshot
├── analytics/
│   └── screenshot.png    <- Analytics tab screenshot
├── limits/
│   └── screenshot.png    <- Limits tab screenshot
└── settings/
    └── screenshot.png    <- Settings tab screenshot
```

## How to Add Screenshots

1. Take a screenshot of the extension tab in Chrome
2. Save the screenshot as `screenshot.png` in the corresponding tab folder
3. Recommended dimensions: 580px width (height can vary)
4. The live preview will automatically use the screenshot if it exists

## Notes

- If no screenshot exists, the component-based preview will be shown
- Screenshots are checked on page load via HEAD requests
- Supported formats: PNG (recommended), JPG, WebP

---
name: tunnel-animation-selenium-production
overview: Create a production-ready Selenium test for the tunnel animation that validates visual elements, animation timing, and logo interactivity with proper error handling and integration.
todos:
  - id: create-test-file
    content: Create tunnel-animation.test.js with proper structure and imports
    status: pending
  - id: setup-webdriver
    content: Implement before/after hooks for WebDriver setup and cleanup
    status: pending
  - id: visual-elements-test
    content: Implement test for visual elements (#1ProTip text, squares, logo)
    status: pending
  - id: animation-timing-test
    content: Implement test for animation timing and sequence progression
    status: pending
  - id: interactivity-test
    content: Implement test for logo interactivity after animation completes
    status: pending
  - id: error-handling
    content: Add robust error handling and meaningful error messages
    status: pending
  - id: documentation
    content: Add code comments and ensure test is production-ready
    status: pending
---

# Tunnel Animation Selenium Test - Production Implementation

## File Structure

- Create `apps/1protip.com/tests/selenium/tunnel-animation.test.js`
- Follow existing test patterns from `smoke.test.js`
- Use Node.js test framework (node:test)
- Integrate with existing test suite via `test:selenium` npm script

## Test Configuration

- URL: `http://localhost:8081` (Expo dev server, not 0.0.0.0:3333)
- Browser: Firefox headless (matching existing tests)
- Assumes Expo dev server is running (no server spawn needed)
- Timeouts: Appropriate for 3.5+ second animation sequence

## Production-Ready Features

### 1. Robust Element Detection

- Use multiple selector strategies (CSS, XPath, text content)
- Handle React Native Web rendering (elements may have dynamic classes)
- Wait for elements with explicit timeouts
- Graceful handling of missing elements

### 2. Animation Timing Validation

- Verify animation progression over time
- Check element count changes during sequence
- Validate timing windows (3 seconds for squares, 3.5 seconds for logo)
- Use `driver.executeScript` to check computed styles

### 3. Visual Elements Tests

- Test "#1ProTip" text presence and visibility
- Verify rounded square border elements (8 squares)
- Check LinkedIn logo square (9th square, filled)
- Validate text positioning doesn't overlap logo
- Use XPath for text content matching

### 4. Interactivity Tests

- Wait for animation completion before testing interactivity
- Verify logo is enabled and clickable
- Test click behavior (handle OAuth flow gracefully)
- Verify page stability after interactions

### 5. Error Handling

- Catch and handle timeout errors gracefully
- Provide meaningful error messages
- Skip tests if Expo server not available
- Log test progress for debugging

### 6. Test Structure

```javascript
before: Setup WebDriver (assume Expo running on :8081)
after: Cleanup WebDriver
test('Tunnel animation visual elements render correctly')
test('Animation sequence completes in expected timeframe')
test('LinkedIn logo becomes interactive after animation')
```

## Implementation Details

- Use `By.xpath` for text content matching ("#1ProTip", "in")
- Use `By.css` with attribute selectors for animated elements
- Check `border-radius` style to identify rounded squares
- Use `driver.executeScript` to check opacity, size, visibility
- Implement custom wait conditions for animation states
- Add descriptive test names and assertions

## Integration

- Works with existing `test:selenium` npm script
- Compatible with CI/CD pipeline (GitHub Actions)
- Follows same patterns as `smoke.test.js` and `linkedin-scope.test.js`
- No breaking changes to existing test infrastructure
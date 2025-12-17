# Selenium Tests - Freezing Issue Fixes

## Issues Identified and Fixed

### 1. **Server Process Cleanup**
**Problem**: The `stopServer()` function was using `SIGTERM` but not waiting for the process to terminate, causing processes to hang.

**Fix**: 
- Made `stopServer()` async and wait for process exit
- Added fallback `SIGKILL` after 2 seconds if process doesn't respond to `SIGTERM`
- Ensures processes are properly cleaned up

### 2. **Driver Cleanup**
**Problem**: If tests failed or timed out, Firefox driver processes could hang indefinitely.

**Fix**:
- Added timeout wrapper around `driver.quit()` (5 second max)
- Wrapped in try-catch to handle errors gracefully
- Ensures driver processes are terminated even on errors

### 3. **Test Timeouts**
**Problem**: Tests had no explicit timeouts, so they could hang forever if something went wrong.

**Fix**:
- Added `{ timeout: 30000 }` to all test cases (30 seconds per test)
- Prevents tests from hanging indefinitely

### 4. **CI Environment Setup**
**Problem**: Ubuntu runners don't have Firefox or geckodriver installed by default.

**Fix**:
- Added steps to install `firefox-esr` and `geckodriver` in CI workflow
- Added job-level timeout (10 minutes) to prevent infinite hangs
- Added process cleanup in workflow step with `pkill` fallback

### 5. **Multiple Test Files Running in Parallel**
**Problem**: Multiple test files starting servers on different ports could conflict or cause resource issues.

**Fix**:
- Each test file uses its own port (4173, 4174, etc.)
- Improved cleanup ensures processes don't leak between test files
- Workflow uses `timeout` command to kill all processes if tests hang

## Testing

To test locally:
```bash
cd apps/free
npm run test:selenium
```

To test in CI:
```bash
gh workflow run test-selenium.yml
```

## Files Modified

1. `apps/free/tests/selenium/smoke.test.js` - Fixed cleanup and added timeouts
2. `apps/free/tests/selenium/tab-bar.test.js` - Fixed cleanup and added timeouts  
3. `apps/free/tests/selenium/tunnel-animation.test.js` - Fixed cleanup and added timeouts
4. `.github/workflows/test-selenium.yml` - New workflow with proper CI setup

## Next Steps

1. Commit the workflow file
2. Run the workflow via `gh workflow run test-selenium.yml`
3. Monitor the run to ensure tests complete without freezing
4. If successful, integrate into main deploy workflow


# PennyLog Test Flows

## 1. Guest Mode Flow
- [ ] Open app, see guest mode warning banner
- [ ] Click "Continue as Guest" in auth modal
- [ ] Add some test expenses with different categories
- [ ] Add an expense with a receipt image
- [ ] Export expenses to CSV
- [ ] Verify CSV contains receipts (as base64)
- [ ] Clear localStorage and verify data is lost (refresh warning)

## 2. Sign-Up Flow
- [ ] Click "Sign Up" tab in auth modal
- [ ] Fill in name, email, password, confirm password
- [ ] Submit form
- [ ] Should see email verification screen
- [ ] Check that "Resend Verification Email" works
- [ ] Open email and click verification link
- [ ] Come back and click "I've Verified My Email"
- [ ] Should be logged in successfully

## 3. Sign-In Flow
- [ ] If not verified, should get error about email not confirmed
- [ ] If verified, should log in successfully
- [ ] Google sign-in should work (if configured)

## 4. Export/Import Flow
- [ ] Create some expenses with receipts
- [ ] Export to CSV
- [ ] Clear all data
- [ ] Import CSV
- [ ] Verify all expenses and receipts are restored

## 5. Receipt Viewing Flow
- [ ] Add expense with receipt
- [ ] Click on receipt in expense list
- [ ] Should see full-size modal with proper z-index
- [ ] Click outside to close
- [ ] Should work on mobile (responsive)

## 6. Data Persistence
- [ ] Guest mode: data in sessionStorage (lost on refresh)
- [ ] Authenticated: data in Supabase (persisted)
- [ ] Guest warning should be persistent for guest users

## Issues Fixed
- ✅ Removed guest-to-authenticated migration
- ✅ Fixed syntax errors in AuthModal
- ✅ Added email verification flow
- ✅ Fixed CSV export/import with receipts
- ✅ Fixed "Click to view full size" for receipts
- ✅ Added persistent guest mode warnings
- ✅ Removed "X expense(s) will be saved" message

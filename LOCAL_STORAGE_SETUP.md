# 🚀 Quick Start with Local Storage

The LoanLedger app now runs in **LOCAL STORAGE MODE** by default - no Firebase setup required!

## ✅ What's Different?

- ✅ **No Firebase Configuration Needed**
- ✅ **All data stored locally** on your device using AsyncStorage
- ✅ **Instant setup** - just install and run
- ✅ **Perfect for testing** and development

## 📦 Installation

```bash
# Install dependencies
npm install

# Start the app
npm start
```

That's it! No Firebase, no `.env` file, no configuration needed.

## 🎯 Running the App

### Web Browser (Easiest)
```bash
npm run web
```
Then open `http://localhost:19006` in your browser.

### Mobile Device
1. Install **Expo Go** app on your phone
2. Run `npm start`
3. Scan the QR code with your phone

### Android Emulator
```bash
npm run android
```

### iOS Simulator (macOS only)
```bash
npm run ios
```

## 👤 Creating an Account

Since we're using local storage:

1. Open the app
2. Tap **"Sign Up"**
3. Enter **any email** (e.g., `demo@test.com`)
4. Enter **any password** (min 6 characters)
5. Enter your name
6. Tap **"Create Account"**

**Note:** The email doesn't need to be real - it's just stored locally!

## 💾 How It Works

### Data Storage
All data is stored in AsyncStorage:
- **Loans**: `@loanledger_loans`
- **Users**: `@loanledger_users`
- **Current User**: `@loanledger_current_user`

### Authentication
- Simple email/password validation (no real verification)
- Session persists until you log out
- Password is stored locally (not hashed - for demo only)

### Persistence
- Data persists between app restarts
- Data is device-specific (won't sync across devices)
- Clear data by logging out or reinstalling the app

## 🎮 Try It Out

### Create Your First Loan

1. **Sign up** with any credentials
2. Go to **Dashboard**
3. Tap **"New Loan"**
4. **Step 1:** Enter loan details
   - Amount: `50000`
   - Duration: `12` months
   - Interest: `1` % per month
5. **Step 2:** Review the amortization schedule
6. **Step 3:** Enter borrower details
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `1234567890`
7. **Step 4:** Review and create!

### Track Payments

1. Tap on the loan you just created
2. View progress bar and EMI list
3. Tap **"Mark Paid"** next to an EMI
4. See the progress update in real-time!

## 🔄 Switching to Firebase (Optional)

Want to use Firebase instead? Here's how:

1. **Set up Firebase** (see main README.md)

2. **Create `.env` file** with your Firebase credentials

3. **Update `App.js`:**
   ```javascript
   // Change from:
   import { AuthProvider } from './src/contexts/AuthContextLocal';
   import AppNavigatorLocal from './src/navigation/AppNavigatorLocal';

   // To:
   import { AuthProvider } from './src/contexts/AuthContext';
   import AppNavigator from './src/navigation/AppNavigator';
   ```

4. **Restart the app**

## 🧹 Clear All Data

To reset and start fresh:

```javascript
// Add this to your code temporarily:
import { localLoans } from './src/services/localStorage';
await localLoans.clearAll();
```

Or simply **reinstall the app**.

## 🎨 Features Available in Local Mode

✅ Full authentication (signup, login, logout)
✅ Complete loan creation wizard
✅ Dashboard with metrics
✅ Loan detail view with EMI tracking
✅ Mark EMIs as paid
✅ Dark/Light mode
✅ All UI features

❌ Real-time sync (local storage only)
❌ Multi-device sync
❌ Cloud backup

## 📱 Recommended for Testing

**Local Storage Mode is perfect for:**
- Quick demo and testing
- Development without Firebase costs
- Offline development
- Learning React Native
- Prototyping

**Use Firebase Mode for:**
- Production deployment
- Multi-user scenarios
- Cloud backup
- Real-time sync across devices

## 🆘 Troubleshooting

### "Can't sign in"
- Make sure you created an account first
- Email and password are case-sensitive

### "Data disappeared"
- AsyncStorage may clear on app uninstall
- Use Firebase mode for persistent storage

### "App won't start"
- Run `npm install` again
- Try `npx expo start -c` to clear cache

## 💡 Tips

- **Test multiple users:** Create multiple accounts with different emails
- **Test payments:** Mark different EMIs as paid to see progress
- **Toggle dark mode:** Profile → Dark Mode toggle
- **Fresh start:** Log out and create a new account

---

**Enjoy testing LoanLedger! 🎉**

Need Firebase setup? See [README.md](./README.md) for full Firebase configuration.

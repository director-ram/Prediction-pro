# PredictPro - Crypto Price Prediction Platform

A decentralized prediction platform built on Solana where users can stake SOL tokens on cryptocurrency price predictions and earn rewards for accurate forecasts.

## 🚀 Features

- **Price Predictions**: Make predictions on cryptocurrency prices with customizable timeframes
- **Solana Integration**: Stake SOL tokens using Phantom wallet
- **Oracle Resolution**: Automatic prediction resolution using real-time price feeds
- **Leaderboard**: Compete with other users and track performance
- **Admin Panel**: Comprehensive management tools for platform operators
- **Mobile Optimized**: Responsive design with mobile wallet support

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom mobile optimizations
- **Blockchain**: Solana Web3.js, Phantom Wallet Adapter
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Static export ready for any hosting platform

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd predictpro-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your_platform_wallet_address
```

5. Run the development server:
```bash
npm run dev
```

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run the migrations in order:
```bash
# Apply all migrations in the supabase/migrations folder
# These will set up the complete database schema
```

3. Configure Row Level Security policies (included in migrations)

## 🔐 Authentication Setup

The platform supports multiple authentication methods:

- **Email/Password**: Standard email authentication
- **Google OAuth**: Social login (requires Google Cloud Console setup)
- **Wallet-Only**: Direct crypto wallet authentication
- **Hybrid**: Email + Wallet connection

### Google OAuth Setup (Optional)

1. Create a Google Cloud Console project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Configure in Supabase Auth settings

See `docs/GOOGLE_AUTH_SETUP.md` for detailed instructions.

## 🏗️ Project Structure

```
├── components/           # React components
│   ├── AuthModal.tsx    # Authentication modal
│   ├── PredictionForm.tsx # Create predictions
│   ├── PredictionsList.tsx # View predictions
│   ├── Leaderboard.tsx  # User rankings
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useSupabaseAuth.ts # Authentication logic
│   ├── useAdminAuth.ts  # Admin access control
│   └── ...
├── pages/               # Next.js pages
│   ├── index.tsx        # Main application
│   ├── admin.tsx        # Admin panel
│   └── auth/
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
├── lib/                 # Utility libraries
└── docs/               # Documentation
```

## 🎮 Usage

### For Users

1. **Sign Up**: Create account with email, Google, or wallet
2. **Connect Wallet**: Link Phantom wallet for SOL transactions
3. **Make Predictions**: Choose asset, target price, and stake amount
4. **Track Performance**: Monitor predictions and earnings
5. **Compete**: Climb the leaderboard with accurate predictions

### For Admins

1. **Access Admin Panel**: Connect with admin wallet address
2. **Manage Oracles**: Resolve predictions manually if needed
3. **Monitor Platform**: View user activity and system health
4. **Handle Withdrawals**: Process user withdrawal requests

## 🔧 Configuration

### Platform Wallet

Set your platform's receiving wallet address in `.env`:
```env
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your_wallet_address
```

This wallet:
- Receives user deposits
- Pays out winnings
- Grants admin access to the holder

### Admin Access

Admin features are restricted to the platform wallet address holder:
- Oracle management
- User withdrawal processing
- System monitoring

## 🚀 Deployment

### Static Export (Recommended)

```bash
npm run build
```

The app is configured for static export and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Environment Variables for Production

Ensure these are set in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`

## 📱 Mobile Support

- **Responsive Design**: Optimized for all screen sizes
- **Mobile Wallets**: Deep linking support for Phantom mobile
- **Touch Optimized**: Large touch targets and mobile-friendly UI
- **Progressive Web App**: Can be installed on mobile devices

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Wallet Verification**: Cryptographic signature verification
- **Admin Access Control**: Restricted admin functions
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error management

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 Documentation

- `docs/GOOGLE_AUTH_SETUP.md` - Google OAuth configuration
- `docs/GOOGLE_AUTH_TROUBLESHOOTING.md` - Common auth issues
- `docs/GOOGLE_AUTH_DEBUG.md` - Debug guide
- `docs/GOOGLE_AUTH_FIX.md` - Quick fixes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation in the `docs/` folder
2. Review common troubleshooting guides
3. Open an issue on GitHub

## 🔮 Roadmap

- [ ] Additional cryptocurrency support
- [ ] Advanced prediction types
- [ ] Social features and following
- [ ] Mobile app development
- [ ] Integration with more wallets
- [ ] Advanced analytics dashboard

---

Built with ❤️ for the Solana ecosystem
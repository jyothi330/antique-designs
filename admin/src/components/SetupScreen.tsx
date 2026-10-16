/** Shown when .env.local is missing or incomplete */
export default function SetupScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8ee] to-[#ede5d4] flex items-center justify-center p-4">
      <div className="bg-white border border-[#ede5d4] rounded-2xl shadow-xl w-full max-w-lg p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-amber-400 bg-white shadow mb-3">
            <svg viewBox="0 0 80 80" style={{width:32,height:32}} fill="none">
              <path d="M40 6L48 28H72L53 42L61 64L40 52L19 64L27 42L8 28H32Z" stroke="#c98d1a" strokeWidth="4" fill="none"/>
              <circle cx="40" cy="40" r="10" fill="#c98d1a"/>
            </svg>
          </div>
          <div className="font-serif font-bold text-amber-800 tracking-wider text-base">ANTIQUE DESIGNS</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Admin Portal · Setup</div>
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3 mb-6">
          <span className="text-xl mt-0.5">⚙️</span>
          <div>
            <p className="font-bold text-amber-800 text-sm mb-0.5">Firebase not configured</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              The app needs your Firebase project credentials before it can run.
              Follow the steps below to connect it.
            </p>
          </div>
        </div>

        {/* Steps */}
        <ol className="space-y-4 mb-6">
          {[
            {
              n: '1',
              title: 'Create or open your Firebase project',
              body: <>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-700 underline font-medium">console.firebase.google.com</a> → create a project (or use an existing one).</>,
            },
            {
              n: '2',
              title: 'Get your web app config',
              body: 'Project Settings → General → Your apps → Web app → copy the config object.',
            },
            {
              n: '3',
              title: 'Create .env.local in admin/',
              body: (
                <>
                  <p className="mb-2">Create the file <code className="bg-gray-100 px-1 rounded text-xs">antique_designs_project/admin/.env.local</code> with:</p>
                  <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-x-auto leading-relaxed">{`VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id`}</pre>
                </>
              ),
            },
            {
              n: '4',
              title: 'Enable Firebase services',
              body: 'In Firebase Console: enable Authentication (Email/Password), Firestore Database, and Storage.',
            },
            {
              n: '5',
              title: 'Restart the dev server',
              body: <>Stop the terminal running <code className="bg-gray-100 px-1 rounded text-xs">npm run dev</code> and start it again. The app will load.</>,
            },
          ].map(step => (
            <li key={step.n} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step.n}
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-800 mb-1">{step.title}</p>
                <div className="text-gray-500 text-xs leading-relaxed">{step.body}</div>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-xs text-gray-400 text-center">
          See <code className="bg-gray-100 px-1 rounded">.env.example</code> in the admin folder for the full variable list.
        </p>
      </div>
    </div>
  );
}

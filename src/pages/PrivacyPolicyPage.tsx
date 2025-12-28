import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#D97757] hover:text-[#C5654A] mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E8E3D9] dark:border-gray-700 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#0A0A0A] dark:text-white mb-2 font-[Georgia,'Times_New_Roman',serif]">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#4B535A] dark:text-gray-400 mb-8">
            Last updated: December 2024
          </p>

          <div className="space-y-6 text-[#0A0A0A] dark:text-gray-200">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">1. Introduction</h2>
              <p className="leading-relaxed">
                NDhub ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical education platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">2. Information We Collect</h2>
              <p className="leading-relaxed mb-3">We collect information that you provide directly to us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
                <li><strong>Authentication Data:</strong> If you sign in with Google or Facebook, we receive your name and email from those services</li>
                <li><strong>Learning Progress:</strong> Your exam answers, quiz progress, case completion status, notes, and annotations</li>
                <li><strong>Usage Data:</strong> How you interact with our platform to improve the learning experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Save your learning progress across devices</li>
                <li>Personalize your learning experience</li>
                <li>Communicate with you about your account and updates</li>
                <li>Ensure the security of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">4. Data Storage and Security</h2>
              <p className="leading-relaxed">
                Your data is stored securely using Firebase, a Google Cloud service. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">5. Data Sharing</h2>
              <p className="leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in operating our platform (subject to confidentiality agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">6. Your Rights</h2>
              <p className="leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">7. Third-Party Authentication</h2>
              <p className="leading-relaxed">
                When you sign in using Google or Facebook, those services may collect information as specified in their own privacy policies. We only receive your basic profile information (name and email) necessary for account creation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">8. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal data for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">9. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">10. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:support@ndhub.com" className="text-[#D97757] hover:text-[#C5654A]">
                  support@ndhub.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

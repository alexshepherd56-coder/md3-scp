import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DataDeletionPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to a backend endpoint
    setSubmitted(true)
  }

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
            User Data Deletion
          </h1>
          <p className="text-sm text-[#4B535A] dark:text-gray-400 mb-8">
            Request deletion of your account and personal data
          </p>

          <div className="space-y-6 text-[#0A0A0A] dark:text-gray-200">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">Your Right to Deletion</h2>
              <p className="leading-relaxed">
                At NDhub, we respect your right to privacy and data protection. You can request the deletion of your account and all associated personal data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">What Data Will Be Deleted</h2>
              <p className="leading-relaxed mb-3">When you request account deletion, we will remove:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account information (email, name, profile data)</li>
                <li>All learning progress and exam history</li>
                <li>Notes, annotations, and text markups</li>
                <li>Case completion and flagged items</li>
                <li>Any other personal data associated with your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">Deletion Process</h2>
              <p className="leading-relaxed mb-3">The deletion process works as follows:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Submit a deletion request using the form below or email us</li>
                <li>We will verify your identity to protect against unauthorized requests</li>
                <li>Your data will be permanently deleted within 30 days</li>
                <li>You will receive confirmation once deletion is complete</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">Important Notes</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Deletion is permanent and cannot be undone</li>
                <li>If you signed in with Facebook or Google, we will delete the data we hold; you may also want to revoke app permissions in your Facebook/Google settings</li>
                <li>Some anonymized, aggregated data may be retained for analytics purposes (this cannot identify you)</li>
              </ul>
            </section>

            <section className="pt-4">
              <h2 className="text-xl font-semibold mb-4 text-[#0A0A0A] dark:text-white">Request Data Deletion</h2>

              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200">
                    Your deletion request has been submitted. We will process your request and send confirmation to your email within 30 days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#0A0A0A] dark:text-gray-200 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter the email associated with your account"
                      required
                      disabled={!!user?.email}
                      className="w-full px-4 py-3 border border-[#E8E3D9] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D97757] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    {user?.email && (
                      <p className="text-xs text-[#4B535A] dark:text-gray-400 mt-1">
                        Using your currently signed-in account email
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Request Account Deletion
                  </button>
                </form>
              )}
            </section>

            <section className="pt-4 border-t border-[#E8E3D9] dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-[#0A0A0A] dark:text-white">Alternative Contact</h2>
              <p className="leading-relaxed">
                You can also request data deletion by emailing us directly at:
              </p>
              <p className="mt-2">
                <a href="mailto:support@ndhub.com?subject=Data Deletion Request" className="text-[#D97757] hover:text-[#C5654A]">
                  support@ndhub.com
                </a>
              </p>
              <p className="text-sm text-[#4B535A] dark:text-gray-400 mt-2">
                Please include "Data Deletion Request" in the subject line and the email address associated with your account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

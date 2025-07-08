export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#16161a] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="max-w-none space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">1. Information We Collect</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  complete our surveys, or contact us for support.
                </p>
                <p><strong>Personal Information:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email address</li>
                  <li>Profile information (name, preferences)</li>
                  <li>Survey responses and life assessment data</li>
                  <li>Habit tracking information</li>
                </ul>
                <p><strong>Usage Information:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Device information and browser type</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Log data and performance metrics</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">2. How We Use Your Information</h2>
              <div className="text-gray-400 space-y-3">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Generate personalized insights and recommendations</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to improve user experience</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">3. Information Sharing</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy.
                </p>
                <p>We may share your information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With service providers who assist in our operations</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>In connection with a business transfer</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">4. Data Security</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>Security measures include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">5. Your Rights</h2>
              <div className="text-gray-400 space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt out of communications</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@infinitegame.life
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">6. Cookies and Tracking</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and provide personalized content.
                </p>
                <p>Types of cookies we use:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Essential cookies for site functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">7. Changes to This Policy</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any 
                  changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">8. Contact Us</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  If you have any questions about this privacy policy, please contact us at:
                </p>
                <p>
                  Email: privacy@infinitegame.life<br/>
                  Website: https://infinitegame.life
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
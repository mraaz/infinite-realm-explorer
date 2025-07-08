export default function Terms() {
  return (
    <div className="min-h-screen bg-[#16161a] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Terms of Use
            </h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="max-w-none space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">1. Acceptance of Terms</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  By accessing and using Infinite Game ("the Service"), you accept and agree to be bound by the 
                  terms and provision of this agreement.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">2. Description of Service</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  Infinite Game is a platform designed to help users visualize the long-term impact of their 
                  daily decisions through strategic life planning and habit tracking.
                </p>
                <p>The Service includes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Life assessment questionnaires</li>
                  <li>Personalized insights and recommendations</li>
                  <li>Habit tracking and goal setting tools</li>
                  <li>Progress monitoring and analytics</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">3. User Accounts</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">4. User Conduct</h2>
              <div className="text-gray-400 space-y-3">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Share false or misleading information</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">5. Intellectual Property</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  The Service and its original content, features, and functionality are owned by Infinite Game 
                  and are protected by international copyright, trademark, patent, trade secret, and other 
                  intellectual property laws.
                </p>
                <p>
                  You retain ownership of any content you submit to the Service, but grant us a license to 
                  use it for providing and improving the Service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">6. Privacy</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                  use of the Service, to understand our practices.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">7. Disclaimers</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  The Service is provided "as is" without warranties of any kind. We do not guarantee that 
                  the Service will be uninterrupted, secure, or error-free.
                </p>
                <p>
                  The insights and recommendations provided by the Service are for informational purposes only 
                  and should not be considered professional advice.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">8. Limitation of Liability</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  In no event shall Infinite Game be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising out of your use of the Service.
                </p>
                <p>
                  Our total liability to you for all claims arising from your use of the Service shall not 
                  exceed the amount you paid us in the twelve months preceding the claim.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">9. Termination</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without 
                  prior notice, for conduct that we believe violates these Terms or is harmful to other 
                  users, us, or third parties.
                </p>
                <p>
                  You may terminate your account at any time by contacting us or using the account 
                  deletion feature in the Service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">10. Changes to Terms</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material 
                  changes by email or through the Service.
                </p>
                <p>
                  Your continued use of the Service after changes become effective constitutes acceptance 
                  of the new Terms.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">11. Governing Law</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Australia, 
                  without regard to conflict of law principles.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">12. Contact Information</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p>
                  Email: legal@infinitegame.life<br/>
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
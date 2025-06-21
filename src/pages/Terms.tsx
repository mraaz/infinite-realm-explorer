
import Header from '@/components/Header';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Infinite Game, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Infinite Game is an AI-powered application designed to help users visualize the long-term impact of their daily decisions. 
                Our service provides:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Personalized life assessments across four key pillars: Career, Finances, Health, and Connections</li>
                <li>AI-generated insights and recommendations</li>
                <li>Habit tracking and building tools</li>
                <li>Progress visualization and reporting</li>
                <li>Optional public profile sharing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h2>
              <p className="mb-4">As a user of Infinite Game, you agree to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide accurate and truthful information in your surveys</li>
                <li>Use the service for personal development and self-reflection purposes</li>
                <li>Respect the privacy and rights of other users</li>
                <li>Not attempt to reverse engineer or exploit our AI systems</li>
                <li>Not use the service for any illegal or harmful activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. AI-Generated Content</h2>
              <p className="mb-4">
                Our insights and recommendations are generated using artificial intelligence. You understand that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>AI-generated content is for informational and self-reflection purposes only</li>
                <li>Results should not be considered as professional advice</li>
                <li>You should consult qualified professionals for important life decisions</li>
                <li>The accuracy of projections depends on the quality of input data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Public Profiles</h2>
              <p className="mb-4">
                If you choose to make your profile public:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your insights and progress data will be accessible via a unique URL</li>
                <li>Personal identifying information will not be displayed</li>
                <li>You can change your privacy settings at any time</li>
                <li>You retain ownership of your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Intellectual Property</h2>
              <p className="mb-4">
                The Infinite Game platform, including its design, algorithms, and content, is owned by Infinite Game. 
                You retain ownership of the personal data you provide, while granting us permission to use it to provide our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
              <p className="mb-4">
                Infinite Game is provided "as is" without warranty of any kind. We are not liable for any decisions you make 
                based on our insights or recommendations. The service is intended for personal development and should not replace 
                professional advice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Account Termination</h2>
              <p className="mb-4">
                You may terminate your account at any time through your settings page. We reserve the right to terminate 
                accounts that violate these terms or engage in harmful behavior.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes, 
                and continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Information</h2>
              <p className="mb-4">
                For questions about these terms of service, please contact us at:
              </p>
              <p className="font-medium">legal@infinitegame.life</p>
            </section>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 md:py-6 text-sm text-gray-500 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Infinite Game. All rights reserved.
      </footer>
    </div>
  );
};

export default Terms;

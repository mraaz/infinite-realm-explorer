
import Header from '@/components/Header';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                Infinite Game collects information to provide you with personalized insights about your life trajectory. We collect:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Email address and authentication information when you sign up</li>
                <li>Survey responses about your career, finances, health, and connections</li>
                <li>Habit tracking data and progress information</li>
                <li>Usage analytics to improve our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Generate personalized life insights and projections</li>
                <li>Track your habit progress and provide recommendations</li>
                <li>Enable public sharing of results when you choose to do so</li>
                <li>Improve our AI algorithms and user experience</li>
                <li>Send you important updates about your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Sharing and Public Profiles</h2>
              <p className="mb-4">
                You have full control over your data visibility:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>By default, all your data is private and only visible to you</li>
                <li>You can choose to make your profile public via your settings</li>
                <li>Public profiles are accessible via unique URLs but do not reveal personal identifiers</li>
                <li>We never share your personal data with third parties without your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>All data is encrypted in transit and at rest</li>
                <li>We use secure authentication protocols</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Control the visibility of your profile</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Compliance</h2>
              <p className="mb-4">
                This privacy policy complies with GDPR, Australian Privacy Principles, and other applicable privacy laws. 
                We are committed to protecting your privacy and handling your data responsibly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this privacy policy or how we handle your data, please contact us at:
              </p>
              <p className="font-medium">privacy@infinitegame.life</p>
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

export default Privacy;

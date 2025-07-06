export default function PulseCheck() {
  return (
    <div className="min-h-screen bg-[#16161a] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              60-Second Pulse Check
            </h1>
            <p className="text-gray-400 text-lg">
              Quick check-in to see where you stand right now
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
              <p className="text-gray-300 text-center">
                This is a placeholder for the 60-second pulse check feature. 
                This quick assessment will provide immediate insights into your current situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Medical Documents System</h1>
        
        <div className="grid gap-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Document Views</h2>
            <div className="space-y-4">
              <Link 
                href="/medical" 
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
              >
                <h3 className="text-xl font-semibold mb-2">Tailwind Version</h3>
                <p className="text-gray-600">View medical documents using Tailwind CSS styling</p>
              </Link>
              
              <Link 
                href="/medical-css" 
                className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
              >
                <h3 className="text-xl font-semibold mb-2">Regular CSS Version</h3>
                <p className="text-gray-600">View medical documents using traditional CSS styling</p>
              </Link>
            </div>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <Link 
              href="/dashboard" 
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200"
            >
              <h3 className="text-xl font-semibold mb-2">Performance Dashboard</h3>
              <p className="text-gray-600">View performance metrics and analytics for document operations</p>
            </Link>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Real-time document search and filtering</li>
              <li>Performance tracking for all operations</li>
              <li>Document categorization and type filtering</li>
              <li>Detailed document viewing</li>
              <li>CSV export of performance data</li>
              <li>Responsive and accessible interface</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

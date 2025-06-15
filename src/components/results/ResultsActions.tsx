
import { Share2, Download } from 'lucide-react';

const ResultsActions = () => {
  return (
    <section className="flex flex-col sm:flex-row justify-center items-center gap-4">
       <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto justify-center">
         <Share2 size={18} />
         Share My Life View
       </button>
       <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto justify-center">
         <Download size={18} />
         Download Full Report
       </button>
    </section>
  );
};

export default ResultsActions;

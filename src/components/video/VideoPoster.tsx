
import { Play } from "lucide-react";

interface VideoPosterProps {
  showPoster: boolean;
}

export const VideoPoster = ({ showPoster }: VideoPosterProps) => {
  if (!showPoster) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <Play className="h-10 w-10 text-white/80" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Interactive Video Preview
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          See how our AI analyzes your life across four key pillars
        </p>
      </div>
    </div>
  );
};

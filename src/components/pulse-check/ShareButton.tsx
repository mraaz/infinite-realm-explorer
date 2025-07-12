import React, { useState, useEffect } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isGuestMode } from "@/utils/guestUtils";
import { useLocation } from "react-router-dom";
import PulseCheckLoginModal from "./PulseCheckLoginModal";

interface ShareButtonProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const ShareButton = ({ data }: ShareButtonProps) => {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false); // New state to check for native share support

  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  const isGuest = isGuestMode(isLoggedIn);
  const isTrulyAuthenticated = isLoggedIn && !isGuest;

  // Check for native share support on component mount
  useEffect(() => {
    if (navigator.share && navigator.canShare) {
      setCanNativeShare(true);
    }
  }, []);

  // Generate the share URL once the component mounts or location changes
  useEffect(() => {
    if (isTrulyAuthenticated) {
      const params = new URLSearchParams(location.search);
      const publicId = params.get("id");

      if (publicId) {
        setShareUrl(
          `${window.location.origin}/pulse-check-results?id=${publicId}`
        );
      } else {
        console.warn("Public ID not found in URL for shareable link.");
        setShareUrl("");
      }
    }
  }, [isTrulyAuthenticated, location.search]);

  // Function to handle copying to clipboard (only copy, no native share attempt here)
  const handleCopyLink = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The share link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link via clipboard API:", error);
      // Fallback for older browsers/restricted environments if clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description:
          "The share link has been copied to your clipboard (fallback).",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Function to handle native sharing
  const handleNativeShare = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link not available.",
        variant: "destructive",
      });
      return;
    }

    if (canNativeShare) {
      try {
        await navigator.share({
          title: "My Life Path Pulse Check Results",
          text: "Check out my Life Path Pulse Check results!",
          url: shareUrl,
        });
        toast({
          title: "Results Shared!",
          description:
            "Your pulse check results have been shared successfully.",
        });
      } catch (error) {
        console.error("Native share failed:", error);
        if (error instanceof DOMException && error.name === "AbortError") {
          // User cancelled share
          console.log("Native share cancelled by user.");
        } else {
          toast({
            title: "Sharing Failed",
            description:
              "Could not open native share sheet. Please try copying the link.",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: "Error",
        description: "Native sharing is not supported on this device/browser.",
        variant: "destructive",
      });
      // Optionally, fall back to copy if native share isn't supported and this button is clicked
      handleCopyLink();
    }
  };

  const handlePreviewLink = () => {
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    } else {
      toast({
        title: "Error",
        description: "Share link not available for preview.",
        variant: "destructive",
      });
    }
  };

  // This part of the component is for guests and should be conditionally rendered by PulseCheckActions
  if (!isTrulyAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setShowLoginModal(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105"
        >
          <Share2 size={18} className="mr-2" />{" "}
          {/* Changed icon to Share2 for guest prompt */}
          Sign Up for Magic Links
        </Button>
        <PulseCheckLoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          pulseCheckData={data}
          returnPathAfterAuth="/pulse-check"
        />
      </>
    );
  }

  // This part renders for truly authenticated users
  return (
    <div className="flex items-center space-x-2 w-full max-w-sm mx-auto">
      {/* Read-only URL input field */}
      <div className="relative flex-1">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="w-full pl-3 pr-10 py-2 rounded-md bg-gray-800 text-gray-300 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Loading share link..."
        />
        {/* Optional: Add a small preview button inside the input or next to it */}
        {shareUrl && (
          <button
            onClick={handlePreviewLink}
            className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 hover:text-white"
            aria-label="Preview link"
          >
            <ExternalLink size={18} />
          </button>
        )}
      </div>

      {/* Copy icon button */}
      <Button
        onClick={handleCopyLink}
        variant="outline"
        className="h-10 w-10 p-0 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105"
        aria-label="Copy share link"
      >
        {copied ? (
          <Check size={20} className="text-green-400" />
        ) : (
          <Copy size={20} />
        )}
      </Button>

      {/* NEW: Native Share button - appears only if supported */}
      {canNativeShare && (
        <Button
          onClick={handleNativeShare}
          variant="outline"
          className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105"
          aria-label="Share via native options"
        >
          <Share2 size={20} />
        </Button>
      )}
    </div>
  );
};

export default ShareButton;

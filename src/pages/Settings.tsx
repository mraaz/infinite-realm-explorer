
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, ExternalLink, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useSecureAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [publicName, setPublicName] = useState('');
  const [publicSlug, setPublicSlug] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate('/auth');
      return;
    }
    
    fetchUserProfile();
  }, [user?.id, navigate]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (!error && data) {
      setUserProfile(data);
      setIsPublic(data.is_public || false);
      setPublicName(data.public_name || '');
      setPublicSlug(data.public_slug || '');
    }
  };

  const updateIsPublic = async (checked: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ is_public: checked })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility setting.",
        variant: "destructive",
      });
    } else {
      setIsPublic(checked);
      toast({
        title: "Success",
        description: `Profile is now ${checked ? 'public' : 'private'}.`,
      });
    }
    setLoading(false);
  };

  const updatePublicName = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ public_name: publicName })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update display name.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Display name updated successfully.",
      });
      fetchUserProfile();
    }
    setLoading(false);
  };

  const updatePublicSlug = async () => {
    if (!publicSlug.trim()) {
      toast({
        title: "Error",
        description: "Link name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ public_slug: publicSlug.toLowerCase() })
      .eq('id', user?.id);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "This link name is already taken. Please choose another.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update link name.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success",
        description: "Link name updated successfully.",
      });
      fetchUserProfile();
    }
    setLoading(false);
  };

  const copyShareableLink = async () => {
    const url = `https://infinitegame.life/results/${userProfile?.public_slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Shareable link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ is_deleted: true })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      await signOut();
      navigate('/');
    }
  };

  const openPublicProfile = () => {
    window.open(`https://infinitegame.life/results/${userProfile?.public_slug}`, '_blank');
  };

  if (!user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <UserIcon className="h-10 w-10 text-purple-600" />
            Account Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account and sharing preferences.
          </p>
        </div>

        {/* Account & Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Current Email:</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You sign in using your social accounts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Public Profile & Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Public Profile & Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Make my profile public</Label>
                <p className="text-sm text-gray-500">
                  Your profile page (including snapshots) is visible to anyone with your unique link.
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={updateIsPublic}
                disabled={loading}
              />
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Shareable Link:</Label>
              <div className="mt-1 flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-md text-sm">
                  https://infinitegame.life/results/{userProfile?.public_slug}
                </div>
                <Button onClick={copyShareableLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="publicSlug">Customize Link Name:</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="publicSlug"
                  value={publicSlug}
                  onChange={(e) => setPublicSlug(e.target.value)}
                  placeholder="yourname"
                />
                <Button onClick={updatePublicSlug} disabled={loading}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose something easy to remember!
              </p>
            </div>

            <div>
              <Label htmlFor="publicName">Name on Public Profile:</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="publicName"
                  value={publicName}
                  onChange={(e) => setPublicName(e.target.value)}
                  placeholder="Your display name"
                />
                <Button onClick={updatePublicName} disabled={loading}>
                  Save
                </Button>
              </div>
            </div>

            <Button onClick={openPublicProfile} variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              View My Public Profile
            </Button>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This action will permanently flag your account for deletion. 
                    Enter the text "DELETE" to confirm.
                  </p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                  />
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    disabled={deleteConfirmText !== 'DELETE' || loading}
                    className="w-full"
                  >
                    {loading ? 'Deleting...' : 'Confirm Deletion'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;

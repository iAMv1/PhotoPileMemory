import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Save, Eye, LogOut, ExternalLink } from 'lucide-react';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, refetchUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6');
  const [customMessage, setCustomMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
      setThemeColor(user.themeColor || '#3B82F6');
      setCustomMessage(user.customMessage || '');
      setIsPrivate(user.isPrivate || false);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await apiRequest(`/api/users/${user.username}`, {
        method: 'PATCH',
        body: {
          displayName: displayName || null,
          bio: bio || null,
          birthday: birthday || null,
          themeColor,
          customMessage: customMessage || null,
          isPrivate,
        },
      });

      await refetchUser();

      toast({
        title: 'Profile Updated!',
        description: 'Your birthday page has been updated successfully.',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/birthday/${user.username}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Birthday Page
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Manage Your Birthday Page 🎂</CardTitle>
            <CardDescription>
              Customize how your birthday celebration page looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="username">Username (cannot be changed)</Label>
                  <Input id="username" value={user.username} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should people address you?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday">Your Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About You</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people a bit about yourself..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Customization */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Page Customization</h3>

                <div className="space-y-2">
                  <Label htmlFor="customMessage">Welcome Message</Label>
                  <Textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="A custom message to show on your birthday page..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="themeColor"
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacy Settings</h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPrivate" className="cursor-pointer">
                    Make my page private (coming soon)
                  </Label>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Page Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      {user.viewCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Page URL</p>
                    <Link href={`/birthday/${user.username}`}>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        /birthday/{user.username}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/birthday/${user.username}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

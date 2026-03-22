import {
  Calendar,
  CheckCircle,
  Key,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useStore } from "../store";

export default function ProfilePage() {
  const { currentUser, updateCurrentUser } = useStore();

  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingProfile(true);
    setTimeout(() => {
      updateCurrentUser({ name: name.trim(), phone: phone.trim() });
      toast.success("Profile updated successfully");
      setSavingProfile(false);
    }, 400);
  };

  const handleChangePassword = () => {
    if (currentPwd !== currentUser.password) {
      toast.error("Current password is incorrect");
      return;
    }
    if (newPwd.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPwd(true);
    setTimeout(() => {
      updateCurrentUser({ password: newPwd });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success("Password changed successfully");
      setSavingPwd(false);
    }, 400);
  };

  const memberSince = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-indigo-200 text-sm">
              Manage your account details and password
            </p>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {currentUser.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 capitalize">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                data-ocid="profile.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                value={currentUser.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Input
                value={currentUser.role.replace("_", " ")}
                disabled
                className="bg-gray-50 capitalize"
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <div className="flex items-center h-9">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 capitalize">
                  {currentUser.status}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Member Since</Label>
              <Input value={memberSince} disabled className="bg-gray-50" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="profile.save_button"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="current-pwd">Current Password</Label>
            <Input
              id="current-pwd"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Enter current password"
              data-ocid="profile.input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="new-pwd">New Password</Label>
              <Input
                id="new-pwd"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-pwd">Confirm New Password</Label>
              <Input
                id="confirm-pwd"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleChangePassword}
              disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              data-ocid="profile.submit_button"
            >
              {savingPwd ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useStore } from "../store";

export default function RegisterApprovedPage() {
  const { navigate } = useStore();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-emerald-950">
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-green-700/15 blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border border-emerald-900/30 bg-white/[0.97] backdrop-blur-sm relative z-10">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Approved!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your application has been approved by the admin. You can now login
            with your registered credentials.
          </p>
          <Button
            onClick={() => navigate("login")}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-md shadow-emerald-900/20"
            data-ocid="register_approved.primary_button"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useStore } from "../store";

export default function RegisterPendingPage() {
  const { navigate } = useStore();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-teal-950">
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-emerald-700/15 blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border border-teal-900/30 bg-white/[0.97] backdrop-blur-sm relative z-10">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-200">
            <Clock className="h-9 w-9 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Submitted
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your application has been submitted successfully. Please wait for
            admin approval. You will be able to login once your account is
            activated.
          </p>
          <Button
            onClick={() => navigate("login")}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-md shadow-teal-900/20"
            data-ocid="register_pending.primary_button"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

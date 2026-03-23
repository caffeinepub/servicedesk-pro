import { AlertTriangle, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useStore } from "../store";

export default function RegisterRejectedPage() {
  const { navigate, rejectionReason, setRejectionReason } = useStore();

  const handleApplyAgain = () => {
    setRejectionReason("");
    navigate("register");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-rose-950">
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-red-700/15 blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border border-rose-900/30 bg-white/[0.97] backdrop-blur-sm relative z-10">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <XCircle className="h-9 w-9 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Rejected
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Your application has been rejected by the admin.
          </p>
          {rejectionReason && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-5 text-left">
              <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-700 mb-0.5">
                  Reason from Admin:
                </p>
                <p className="text-sm text-rose-800">{rejectionReason}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleApplyAgain}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold shadow-md shadow-rose-900/20"
              data-ocid="register_rejected.primary_button"
            >
              Apply Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("login")}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              data-ocid="register_rejected.secondary_button"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, FileText, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Documents() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Document Vault</h1>
          <p className="text-slate-400">Your generated compliance documents</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Subscription Banner */}
        <Card className="mb-8 border-amber-600 bg-amber-950/30 p-6 flex items-start gap-4">
          <AlertCircle className="text-amber-500 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-amber-500 mb-2">Upgrade to Core Plan</h3>
            <p className="text-slate-300 mb-4">
              Full WISP and board-level compliance reports are available with a Core subscription ($199/month).
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Upgrade to Core
            </Button>
          </div>
        </Card>

        {/* Documents Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* WISP Document */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="text-amber-500" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-white">WISP Document</h3>
                  <p className="text-sm text-slate-400">Written Information Security Program</p>
                </div>
              </div>
              <Lock className="text-slate-500" size={24} />
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-slate-300">
                <span className="font-semibold">Status:</span> Not generated
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Last Updated:</span> Never
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" disabled>
                View PDF
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Download PDF
              </Button>
            </div>
          </Card>

          {/* Board Report */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="text-amber-500" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-white">Board Report</h3>
                  <p className="text-sm text-slate-400">Annual Compliance Report</p>
                </div>
              </div>
              <Lock className="text-slate-500" size={24} />
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-slate-300">
                <span className="font-semibold">Status:</span> Not generated
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Last Updated:</span> Never
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" disabled>
                View PDF
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Download PDF
              </Button>
            </div>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-12 bg-slate-800 border-slate-700 p-8">
          <h3 className="text-xl font-bold text-white mb-4">How to Generate Documents</h3>
          <ol className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="font-bold text-amber-500">1.</span>
              <span>Complete all 9 sections of the compliance wizard</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-amber-500">2.</span>
              <span>Your compliance score will be calculated automatically</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-amber-500">3.</span>
              <span>Upgrade to Core plan to generate and download documents</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-amber-500">4.</span>
              <span>Documents are populated with your dealership data</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

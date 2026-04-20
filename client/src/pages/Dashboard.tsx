import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SAFEGUARDS_SECTIONS } from "@/data/safeguards-questions";
import { calculateSectionScore, calculateOverallScore } from "@/lib/scoring";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, session, loading } = useAuth();
  const [overallScore, setOverallScore] = useState(0);
  const [sectionScores, setSectionScores] = useState<Record<number, number>>({});
  const [isLoadingScores, setIsLoadingScores] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoadingScores(false);
      return;
    }

    supabase
      .from("compliance_answers")
      .select("section, answers")
      .eq("user_id", session.user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load compliance answers:", error);
          setIsLoadingScores(false);
          return;
        }

        const grouped: Record<number, Record<string, any>> = {};
        (data ?? []).forEach((row) => {
          grouped[row.section] = (row.answers as Record<string, any>) ?? {};
        });

        const newScores: Record<number, number> = {};
        const allScores = [];

        for (const sec of SAFEGUARDS_SECTIONS) {
          const sectionAnswers = grouped[sec.number] || {};
          const scoreResult = calculateSectionScore(sectionAnswers, sec.questions);
          newScores[sec.number] = scoreResult.score;
          allScores.push({ ...scoreResult, section: sec.number, sectionName: sec.name });
        }

        setSectionScores(newScores);

        if (allScores.length > 0) {
          const overall = calculateOverallScore(allScores);
          setOverallScore(overall.overall);
        }

        setIsLoadingScores(false);
      });
  }, [session?.user?.id]);

  if (loading || isLoadingScores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={40} />
          <p className="text-slate-300">Loading your compliance data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const getRiskColor = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 60) return "text-orange-500";
    if (score < 80) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBgColor = (score: number) => {
    if (score < 40) return "bg-red-950/30 border-red-600";
    if (score < 60) return "bg-orange-950/30 border-orange-600";
    if (score < 80) return "bg-yellow-950/30 border-yellow-600";
    return "bg-green-950/30 border-green-600";
  };

  const sectionNames = SAFEGUARDS_SECTIONS.reduce<Record<number, string>>(
    (acc, sec) => { acc[sec.number] = sec.name; return acc; },
    {}
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Compliance Dashboard</h1>
            <p className="text-slate-400">Welcome, {user.name || user.email}</p>
          </div>
          <Button onClick={() => setLocation("/wizard")} className="bg-amber-600 hover:bg-amber-700">
            Continue Assessment
          </Button>
        </div>
      </div>

      {/* FTC Urgency Banner */}
      <div className="border-b border-orange-600 bg-orange-950/30">
        <div className="container mx-auto px-4 py-4 flex items-start gap-4">
          <AlertTriangle className="text-orange-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-orange-300 mb-1">⚠️ FTC Safeguards Rule Compliance Required</h3>
            <p className="text-sm text-orange-200">
              All auto dealerships must comply with FTC Safeguards Rule (16 CFR Part 314). Non-compliance can result in
              significant penalties. Ensure your dealership has a Written Information Security Program (WISP) in place.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Overall Score Card */}
        <Card className={`border-2 p-8 mb-12 ${getRiskBgColor(overallScore)}`}>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Overall Compliance Score</h2>
              <div className="flex items-baseline gap-3">
                <div className={`text-5xl font-bold ${getRiskColor(overallScore)}`}>{overallScore}%</div>
                <div className="text-lg text-slate-400">
                  {overallScore < 40 && "🔴 Critical"}
                  {overallScore >= 40 && overallScore < 60 && "🟠 High Risk"}
                  {overallScore >= 60 && overallScore < 80 && "🟡 Medium Risk"}
                  {overallScore >= 80 && "🟢 Low Risk"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Sections Completed</h3>
              <div className="text-3xl font-bold text-white">
                {Object.values(sectionScores).filter((s) => s > 0).length} <span className="text-lg text-slate-400">/ 9</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Next Steps</h3>
              <Button
                size="sm"
                onClick={() => setLocation("/documents")}
                className="bg-amber-600 hover:bg-amber-700 w-full"
              >
                Generate Documents
              </Button>
            </div>
          </div>
        </Card>

        {/* Section Scores Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Section Scores</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(sectionScores).map(([sectionNum, score]) => {
              const num = parseInt(sectionNum);
              return (
                <Card key={num} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{sectionNames[num]}</h3>
                      <p className="text-sm text-slate-400">Section {num}</p>
                    </div>
                    {score >= 80 && <CheckCircle2 className="text-green-500" size={20} />}
                    {score < 80 && score >= 60 && <AlertCircle className="text-yellow-500" size={20} />}
                    {score < 60 && <AlertTriangle className="text-red-500" size={20} />}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Progress</span>
                      <span className={`font-bold ${getRiskColor(score)}`}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>

                  {score < 80 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation("/wizard")}
                      className="w-full text-xs"
                    >
                      Complete Section
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Gap Analysis */}
        <Card className="bg-slate-800 border-slate-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-amber-500" size={24} />
            <h2 className="text-2xl font-bold text-white">Gap Analysis</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(sectionScores)
              .filter(([, score]) => score < 80)
              .map(([sectionNum, score]) => {
                const num = parseInt(sectionNum);
                const gap = 100 - score;
                return (
                  <div key={num} className="border-b border-slate-700 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-200">{sectionNames[num]}</span>
                      <span className="text-sm text-slate-400">{gap}% gap</span>
                    </div>
                    <Progress value={score} className="h-1" />
                  </div>
                );
              })}
          </div>

          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-300">
              Focus on completing sections with the largest gaps. Critical sections (marked with 🔴) should be your
              highest priority.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

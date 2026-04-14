import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SAFEGUARDS_SECTIONS, type Section, type Question } from "@/data/safeguards-questions";
import { calculateSectionScore, calculateOverallScore } from "@/lib/scoring";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Wizard() {
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Record<string, any>>>({});
  const [sectionScores, setSectionScores] = useState<Record<number, number>>({});
  const [overallScore, setOverallScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<"critical" | "high" | "medium" | "low">("critical");

  const totalSections = SAFEGUARDS_SECTIONS.length;
  const progress = ((currentSection + 1) / totalSections) * 100;
  const section = SAFEGUARDS_SECTIONS[currentSection];

  // Calculate scores whenever answers change
  useEffect(() => {
    const newScores: Record<number, number> = {};
    const allScores = [];

    for (const sec of SAFEGUARDS_SECTIONS) {
      const sectionAnswers = answers[sec.number] || {};
      const scoreResult = calculateSectionScore(sectionAnswers, sec.questions);
      newScores[sec.number] = scoreResult.score;
      allScores.push({
        ...scoreResult,
        section: sec.number,
        sectionName: sec.name,
      });
    }

    setSectionScores(newScores);

    if (allScores.length > 0) {
      const overall = calculateOverallScore(allScores);
      setOverallScore(overall.overall);
      setRiskLevel(overall.riskLevel);
    }
  }, [answers]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [questionId]: value,
      },
    }));
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-slate-400";
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-950/30 border-red-600";
      case "high":
        return "bg-orange-950/30 border-orange-600";
      case "medium":
        return "bg-yellow-950/30 border-yellow-600";
      case "low":
        return "bg-green-950/30 border-green-600";
      default:
        return "bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">FTC Safeguards Compliance Wizard</h1>
          <p className="text-slate-400">
            Section {currentSection + 1} of {totalSections}: {section.name}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-slate-700 bg-slate-900/30">
        <div className="container mx-auto px-4 py-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-400 mt-2">
            {Math.round(progress)}% Complete
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-2">
              {SAFEGUARDS_SECTIONS.map((sec, index) => {
                const score = sectionScores[sec.number] || 0;
                const isComplete = score > 0;

                return (
                  <button
                    key={sec.number}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      index === currentSection
                        ? "bg-amber-600 text-white font-semibold ring-2 ring-amber-400"
                        : isComplete
                          ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-semibold">{sec.number}. {sec.name}</div>
                        {isComplete && <div className="text-xs mt-1">{score}%</div>}
                      </div>
                      {isComplete && <CheckCircle2 size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overall Score Card */}
            <Card className={`border-2 p-6 ${getRiskBgColor()}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Overall Compliance Score</h3>
                  <div className="flex items-baseline gap-2">
                    <div className={`text-4xl font-bold ${getRiskColor()}`}>{overallScore}%</div>
                    <div className="text-sm text-slate-400 capitalize">{riskLevel} Risk</div>
                  </div>
                </div>
                {riskLevel === "critical" && <AlertTriangle className={getRiskColor()} size={32} />}
                {riskLevel === "high" && <AlertCircle className={getRiskColor()} size={32} />}
                {riskLevel === "low" && <CheckCircle2 className={getRiskColor()} size={32} />}
              </div>
            </Card>

            {/* Section Content */}
            <Card className="bg-slate-800 border-slate-700 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{section.name}</h2>
                <p className="text-slate-300">{section.description}</p>
                <div className="mt-4">
                  <div className="text-sm text-slate-400 mb-2">Section Score</div>
                  <div className="flex items-center gap-3">
                    <Progress value={sectionScores[section.number] || 0} className="flex-1 h-2" />
                    <span className="text-lg font-bold text-amber-500 min-w-fit">
                      {sectionScores[section.number] || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {section.questions.map((question) => (
                  <QuestionComponent
                    key={question.id}
                    question={question}
                    value={answers[currentSection]?.[question.id]}
                    onChange={(value) => handleAnswer(question.id, value)}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-12 flex justify-between">
                <Button
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  variant="outline"
                  disabled={currentSection === 0}
                >
                  Previous Section
                </Button>

                {currentSection === totalSections - 1 ? (
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete & View Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentSection(Math.min(totalSections - 1, currentSection + 1))}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Next Section
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestionComponentProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

function QuestionComponent({ question, value, onChange }: QuestionComponentProps) {
  const weightLabel = {
    critical: "🔴 Critical",
    important: "🟡 Important",
    standard: "🟢 Standard",
  };

  return (
    <div className="border-b border-slate-700 pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <label className="block text-sm font-semibold text-slate-200 flex-1">
          {question.text}
        </label>
        <span className="text-xs font-semibold text-slate-400 ml-4 whitespace-nowrap">
          {weightLabel[question.weight]}
        </span>
      </div>

      {question.hint && (
        <p className="text-xs text-slate-400 mb-3 italic">{question.hint}</p>
      )}

      {question.type === "yes_no" && (
        <div className="flex gap-3">
          <button
            onClick={() => onChange("yes")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              value === "yes"
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onChange("no")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              value === "no"
                ? "bg-red-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            No
          </button>
        </div>
      )}

      {question.type === "yes_no_partial" && (
        <div className="flex gap-3">
          <button
            onClick={() => onChange("yes")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              value === "yes"
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onChange("partial")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              value === "partial"
                ? "bg-yellow-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Partial
          </button>
          <button
            onClick={() => onChange("no")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              value === "no"
                ? "bg-red-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            No
          </button>
        </div>
      )}

      {question.type === "text" && (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your response..."
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
        />
      )}
    </div>
  );
}

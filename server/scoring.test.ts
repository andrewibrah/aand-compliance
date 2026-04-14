import { describe, it, expect } from "vitest";

// Scoring algorithm tests
const CRITICAL_WEIGHT = 3;
const IMPORTANT_WEIGHT = 2;
const STANDARD_WEIGHT = 1;

function calculateSectionScore(
  answers: Record<string, any>,
  questions: Array<{ id: string; weight: "critical" | "important" | "standard"; text: string }>
) {
  let totalPoints = 0;
  let earnedPoints = 0;
  const gaps: string[] = [];
  const criticalGaps: string[] = [];

  for (const question of questions) {
    const weight =
      question.weight === "critical"
        ? CRITICAL_WEIGHT
        : question.weight === "important"
          ? IMPORTANT_WEIGHT
          : STANDARD_WEIGHT;

    totalPoints += weight;

    const answer = answers[question.id];
    if (answer === "yes" || answer === true || answer === 1) {
      earnedPoints += weight;
    } else if (answer === "partial" || answer === 0.5) {
      earnedPoints += weight * 0.5;
      gaps.push(question.text);
      if (question.weight === "critical") {
        criticalGaps.push(question.text);
      }
    } else {
      gaps.push(question.text);
      if (question.weight === "critical") {
        criticalGaps.push(question.text);
      }
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    section: 0,
    sectionName: "",
    score,
    maxPoints: totalPoints,
    earnedPoints,
    gaps,
    criticalGaps,
  };
}

describe("Scoring Algorithm", () => {
  describe("calculateSectionScore", () => {
    it("should calculate 100% score when all answers are yes", () => {
      const answers = {
        q1: "yes",
        q2: "yes",
        q3: "yes",
      };

      const questions = [
        { id: "q1", weight: "critical" as const, text: "Question 1" },
        { id: "q2", weight: "important" as const, text: "Question 2" },
        { id: "q3", weight: "standard" as const, text: "Question 3" },
      ];

      const result = calculateSectionScore(answers, questions);

      expect(result.score).toBe(100);
      expect(result.earnedPoints).toBe(result.maxPoints);
      expect(result.gaps.length).toBe(0);
    });

    it("should calculate 0% score when all answers are no", () => {
      const answers = {
        q1: "no",
        q2: "no",
        q3: "no",
      };

      const questions = [
        { id: "q1", weight: "critical" as const, text: "Question 1" },
        { id: "q2", weight: "important" as const, text: "Question 2" },
        { id: "q3", weight: "standard" as const, text: "Question 3" },
      ];

      const result = calculateSectionScore(answers, questions);

      expect(result.score).toBe(0);
      expect(result.earnedPoints).toBe(0);
      expect(result.gaps.length).toBe(3);
    });

    it("should calculate 50% score for partial answers", () => {
      const answers = {
        q1: "partial",
        q2: "no",
      };

      const questions = [
        { id: "q1", weight: "critical" as const, text: "Question 1" },
        { id: "q2", weight: "critical" as const, text: "Question 2" },
      ];

      const result = calculateSectionScore(answers, questions);

      // (0.5 * CRITICAL_WEIGHT + 0 * CRITICAL_WEIGHT) / (2 * CRITICAL_WEIGHT) = 1.5 / 6 = 25%
      expect(result.score).toBe(25);
    });

    it("should identify critical gaps", () => {
      const answers = {
        q1: "no",
        q2: "yes",
      };

      const questions = [
        { id: "q1", weight: "critical" as const, text: "Critical Question" },
        { id: "q2", weight: "important" as const, text: "Important Question" },
      ];

      const result = calculateSectionScore(answers, questions);

      expect(result.criticalGaps.length).toBe(1);
      expect(result.criticalGaps[0]).toBe("Critical Question");
    });

    it("should apply correct weights", () => {
      const answers = {
        q1: "yes",
        q2: "yes",
        q3: "yes",
      };

      const questions = [
        { id: "q1", weight: "critical" as const, text: "Q1" },
        { id: "q2", weight: "important" as const, text: "Q2" },
        { id: "q3", weight: "standard" as const, text: "Q3" },
      ];

      const result = calculateSectionScore(answers, questions);

      const expectedMax = CRITICAL_WEIGHT + IMPORTANT_WEIGHT + STANDARD_WEIGHT;
      expect(result.maxPoints).toBe(expectedMax);
      expect(result.earnedPoints).toBe(expectedMax);
    });
  });
});

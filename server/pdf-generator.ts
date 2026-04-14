import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import type { Dealership, ComplianceAnswer } from "../drizzle/schema";

/**
 * Generate WISP (Written Information Security Program) PDF
 * Based on FTC Safeguards Rule 16 CFR Part 314
 */
export async function generateWISP(
  dealership: Dealership,
  complianceAnswers: ComplianceAnswer[]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();

  let yPosition = height - 50;

  // Helper function to add text
  const addText = (text: string, size: number = 12, bold: boolean = false, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x: 50,
      y: yPosition,
      size,
      color,
      font: bold ? undefined : undefined, // Would use bold font if available
    });
    yPosition -= size + 10;
  };

  // Title
  addText("WRITTEN INFORMATION SECURITY PROGRAM (WISP)", 18, true, rgb(0.2, 0.2, 0.5));
  addText("FTC Safeguards Rule Compliance Document", 12);
  yPosition -= 10;

  // Dealership Info
  addText(`Dealership: ${dealership.name}`, 12, true);
  addText(`Address: ${dealership.address || "N/A"}`, 11);
  addText(`City/State: ${dealership.city || "N/A"}, ${dealership.state || "N/A"}`, 11);
  addText(`Qualified Individual: ${dealership.qualifiedIndividual || "N/A"}`, 11);
  addText(`QI Email: ${dealership.qiEmail || "N/A"}`, 11);
  yPosition -= 10;

  // Executive Summary
  addText("EXECUTIVE SUMMARY", 14, true);
  addText(
    "This Written Information Security Program (WISP) outlines the information security measures " +
      "implemented by the dealership to comply with the FTC Safeguards Rule (16 CFR Part 314).",
    11
  );
  yPosition -= 10;

  // Section 1: Qualified Individual
  addText("1. QUALIFIED INDIVIDUAL", 12, true);
  const qi = complianceAnswers.find((a) => a.section === 1);
  addText(
    `Status: ${qi?.score ? qi.score + "%" : "Not assessed"}`,
    11
  );
  addText(
    "The dealership has designated a Qualified Individual responsible for overseeing and " +
      "implementing the information security program.",
    10
  );
  yPosition -= 10;

  // Sections 2-9 Summary
  for (let i = 2; i <= 9; i++) {
    if (yPosition < 100) {
      page.drawText("(continued on next page)", { x: 50, y: yPosition, size: 10 });
      const newPage = pdfDoc.addPage([612, 792]);
      yPosition = 750;
    }

    const sectionNames = [
      "",
      "Qualified Individual",
      "Risk Assessment",
      "Data Inventory & Classification",
      "Access Controls",
      "Encryption",
      "Vendor & Third-Party Management",
      "Incident Response Plan",
      "Employee Training",
      "Penetration Testing & Monitoring",
    ];

    const answer = complianceAnswers.find((a) => a.section === i);
    addText(`${i}. ${sectionNames[i]}`, 12, true);
    addText(`Compliance Score: ${answer?.score || 0}%`, 11);
    yPosition -= 5;
  }

  // Footer
  yPosition -= 20;
  addText("This document is confidential and for internal use only.", 9);
  addText(`Generated: ${new Date().toLocaleDateString()}`, 9);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate Board-Level Annual Compliance Report
 * Executive summary for board of directors
 */
export async function generateBoardReport(
  dealership: Dealership,
  complianceAnswers: ComplianceAnswer[],
  overallScore: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();

  let yPosition = height - 50;

  // Helper function to add text
  const addText = (text: string, size: number = 12, bold: boolean = false, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x: 50,
      y: yPosition,
      size,
      color,
    });
    yPosition -= size + 10;
  };

  // Title
  addText("ANNUAL COMPLIANCE REPORT", 18, true, rgb(0.2, 0.2, 0.5));
  addText("FTC Safeguards Rule Assessment", 12);
  addText("For Board of Directors", 11);
  yPosition -= 10;

  // Dealership Info
  addText(`Dealership: ${dealership.name}`, 12, true);
  addText(`Report Date: ${new Date().toLocaleDateString()}`, 11);
  yPosition -= 10;

  // Overall Score - Highlighted
  addText("OVERALL COMPLIANCE SCORE", 14, true);
  addText(`${overallScore}%`, 24, true, getRiskColor(overallScore));

  // Risk Assessment
  const riskLevel = getRiskLevel(overallScore);
  addText(`Risk Level: ${riskLevel.toUpperCase()}`, 12, true, getRiskColor(overallScore));
  yPosition -= 10;

  // Key Findings
  addText("KEY FINDINGS", 12, true);

  const criticalGaps = complianceAnswers
    .filter((a) => a.score && a.score < 50)
    .map((a) => `${a.sectionName}: ${a.score}%`);

  if (criticalGaps.length > 0) {
    addText("Critical Gaps (Score < 50%):", 11, true);
    criticalGaps.forEach((gap) => {
      addText(`  • ${gap}`, 10);
    });
  } else {
    addText("No critical gaps identified.", 11);
  }

  yPosition -= 10;

  // Recommendations
  addText("RECOMMENDATIONS", 12, true);
  if (overallScore < 60) {
    addText("1. Conduct comprehensive security audit", 11);
    addText("2. Implement immediate remediation plan", 11);
    addText("3. Allocate budget for security improvements", 11);
    addText("4. Schedule quarterly board updates", 11);
  } else if (overallScore < 80) {
    addText("1. Address remaining compliance gaps", 11);
    addText("2. Enhance employee training program", 11);
    addText("3. Conduct annual penetration testing", 11);
  } else {
    addText("1. Maintain current security posture", 11);
    addText("2. Continue annual assessments", 11);
    addText("3. Monitor regulatory changes", 11);
  }

  yPosition -= 20;

  // Disclaimer
  addText("This report is confidential and intended for board members only.", 9);
  addText("For questions, contact the Qualified Individual.", 9);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function getRiskColor(score: number) {
  if (score < 40) return rgb(1, 0, 0); // Red
  if (score < 60) return rgb(1, 0.5, 0); // Orange
  if (score < 80) return rgb(1, 1, 0); // Yellow
  return rgb(0, 1, 0); // Green
}

function getRiskLevel(score: number) {
  if (score < 40) return "critical";
  if (score < 60) return "high";
  if (score < 80) return "medium";
  return "low";
}

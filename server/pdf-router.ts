import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateWISP, generateBoardReport } from "./pdf-generator";
import { storagePut } from "./storage";

export const pdfRouter = router({
  // Generate WISP PDF
  generateWISP: protectedProcedure.mutation(async ({ ctx }) => {
    const dealership = await db.getDealershipByUserId(ctx.user.id);
    if (!dealership) throw new Error("No dealership found");

    // Check subscription
    const subscription = await db.getSubscription(dealership.id);
    if (!subscription || subscription.plan === "free") {
      throw new Error("Upgrade to Core plan to generate WISP");
    }

    // Get all compliance answers
    const answers = await db.getAllComplianceAnswers(dealership.id);

    // Generate PDF
    const pdfBuffer = await generateWISP(dealership, answers);

    // Upload to S3
    const fileName = `wisp-${dealership.id}-${Date.now()}.pdf`;
    const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");

    // Save document record
    await db.saveGeneratedDocument({
      dealershipId: dealership.id,
      docType: "wisp",
      storagePath: url,
    });

    return { url, success: true };
  }),

  // Generate Board Report PDF
  generateBoardReport: protectedProcedure
    .input(z.object({ overallScore: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dealership = await db.getDealershipByUserId(ctx.user.id);
      if (!dealership) throw new Error("No dealership found");

      // Check subscription
      const subscription = await db.getSubscription(dealership.id);
      if (!subscription || subscription.plan === "free") {
        throw new Error("Upgrade to Core plan to generate board report");
      }

      // Get all compliance answers
      const answers = await db.getAllComplianceAnswers(dealership.id);

      // Generate PDF
      const pdfBuffer = await generateBoardReport(dealership, answers, input.overallScore);

      // Upload to S3
      const fileName = `board-report-${dealership.id}-${Date.now()}.pdf`;
      const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");

      // Save document record
      await db.saveGeneratedDocument({
        dealershipId: dealership.id,
        docType: "board_report",
        storagePath: url,
      });

      return { url, success: true };
    }),

  // Get document download URL
  getDocumentUrl: protectedProcedure
    .input(z.object({ docType: z.string() }))
    .query(async ({ ctx, input }) => {
      const dealership = await db.getDealershipByUserId(ctx.user.id);
      if (!dealership) throw new Error("No dealership found");

      const docs = await db.getGeneratedDocuments(dealership.id, input.docType);
      if (docs.length === 0) return null;

      // Return most recent
      return docs[0];
    }),
});

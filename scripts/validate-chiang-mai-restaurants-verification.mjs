import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadChiangMaiRestaurantVerification(scanRoot = process.cwd()) {
  const read = (path) => JSON.parse(readFileSync(resolve(scanRoot, path), "utf8"));
  return {
    verification: read("data/research/chiang-mai-restaurants-verification.json"),
    registry: read("data/research/chiang-mai-restaurants-evidence.json"),
  };
}

export function validateChiangMaiRestaurantVerification({ verification, registry }) {
  const failures = [];
  const ids = new Set(registry.records.map(({ id }) => id));
  const decisionIds = verification.decisions.map(({ recordId }) => recordId);

  if (verification.status !== "research_verification_only")
    failures.push("verification must remain research-only");
  if (
    verification.publicationEligibility !== "blocked" ||
    verification.productionImportEligibility !== "blocked"
  )
    failures.push("publication or production gate relaxed");
  if (
    !verification.verificationContract.openingHoursDeferred ||
    !verification.verificationContract.directOwnerOperationRequired ||
    !verification.verificationContract.osmAloneCannotVerifyCurrentOperation ||
    verification.verificationContract.coordinatesImported ||
    verification.verificationContract.mediaDownloaded
  )
    failures.push("verification safety contract relaxed");
  if (decisionIds.length !== ids.size || new Set(decisionIds).size !== ids.size)
    failures.push("verification decisions must account for every baseline record once");
  for (const id of decisionIds)
    if (!ids.has(id)) failures.push(`${id}: unknown record`);

  const sourceIds = new Set(verification.sources.map(({ id }) => id));
  for (const source of verification.sources) {
    if (
      !source.url.startsWith("https://") ||
      !source.publisher ||
      !source.retrievedAt ||
      source.rightsStatus !== "facts_only_rights_pending" ||
      source.mediaRightsStatus !== "not_assessed_no_media_downloaded"
    )
      failures.push(`${source.id}: invalid source contract`);
  }
  for (const decision of verification.decisions) {
    if (!decision.reason?.trim()) failures.push(`${decision.recordId}: missing reason`);
    if (
      !["verified_research_record", "pending_more_evidence", "excluded"].includes(
        decision.outcome,
      )
    )
      failures.push(`${decision.recordId}: invalid outcome`);
    for (const sourceId of decision.verificationSourceIds)
      if (!sourceIds.has(sourceId))
        failures.push(`${decision.recordId}: unknown verification source ${sourceId}`);
    if (
      decision.outcome === "verified_research_record" &&
      (!decision.verificationSourceIds.length ||
        decision.checks.currentOperation !== "supported_direct_owner_current_page")
    )
      failures.push(
        `${decision.recordId}: verified without direct current-operation evidence`,
      );
  }

  const reviewed = verification.districts.reduce((sum, row) => sum + row.reviewed, 0);
  if (verification.districts.length !== 25 || reviewed !== registry.records.length)
    failures.push("district matrix must account for 25 districts and every record");
  if (
    verification.summary.baselineRecords !== registry.records.length ||
    verification.summary.reviewedRecords !== registry.records.length ||
    verification.summary.verifiedResearchRecords +
      verification.summary.pendingMoreEvidence +
      verification.summary.excludedRecords !==
      registry.records.length
  )
    failures.push("verification summary totals do not reconcile");

  return failures;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const failures = validateChiangMaiRestaurantVerification(
    loadChiangMaiRestaurantVerification(),
  );
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Chiang Mai restaurant verification contract passed: 175/175 reviewed");
  }
}

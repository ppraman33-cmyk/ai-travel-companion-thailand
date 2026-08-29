import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  loadChiangMaiAttractions,
  validateChiangMaiAttractions,
} from "./validate-chiang-mai-attractions-evidence.mjs";

const expectedTriggers = [
  "new_official_source",
  "new_authority_or_ownership_evidence",
  "new_exact_district_or_visitor_point_evidence",
  "approved_rights_or_freshness_review",
];
const closureIds = new Set([
  "cm-attraction-5003-mae-hae-royal-project-development-centre",
]);

export function loadChiangMaiAttractionsClosure(scanRoot = process.cwd()) {
  return JSON.parse(
    readFileSync(
      resolve(scanRoot, "data/research/chiang-mai-attractions-closure.json"),
      "utf8",
    ),
  );
}

export function validateChiangMaiAttractionsClosure(data, closure) {
  const failures = [...validateChiangMaiAttractions(data)];
  const inheritedLock = data.registry.records
    .filter(({ id }) => !closureIds.has(id))
    .map(({ id, nameTh }) => ({ id, nameTh }));
  const lockHash = createHash("sha256")
    .update(JSON.stringify(inheritedLock))
    .digest("hex");
  const gaps = data.coverage.districts
    .filter(({ coverageStatus }) => coverageStatus === "gap")
    .map(({ code }) => code);

  if (
    closure.status !== "chiang_mai_attractions_evidence_baseline_research_closure" ||
    closure.label !== "Chiang Mai Attractions Evidence Baseline — Research Closure"
  )
    failures.push("closure identity invalid");
  if (closure.baselineCommit !== "f40965aa7315a61f6de30d6b93b9234487721a55")
    failures.push("closure baseline invalid");
  if (
    closure.districtCoverageCount !== 25 ||
    closure.finalRecordCount !== 23 ||
    data.registry.records.length !== 23
  )
    failures.push("closure count contract invalid");
  if (JSON.stringify(gaps) !== JSON.stringify(["5020", "5021"]))
    failures.push("closure coverage-gap contract invalid");
  if (JSON.stringify(closure.acceptedCoverageGaps) !== JSON.stringify(["5020", "5021"]))
    failures.push("closure accepted-gap manifest invalid");
  if (
    closure.inheritedRecordCount !== 22 ||
    inheritedLock.length !== 22 ||
    lockHash !== closure.inheritedIdentityLockSha256
  )
    failures.push("inherited 22-record identity lock invalid");
  if (
    closure.publicationEligibility !== "blocked" ||
    closure.rightsStatus !== "pending_explicit_redistribution_terms" ||
    closure.mediaRightsStatus !== "not_assessed_no_media_downloaded" ||
    closure.contentCompletenessClaim !== "not_claimed"
  )
    failures.push("closure publication/rights gate invalid");
  if (JSON.stringify(closure.revalidationTriggers) !== JSON.stringify(expectedTriggers))
    failures.push("closure revalidation triggers invalid");
  const maeHae = data.registry.records.find(
    ({ id }) => id === "cm-attraction-5003-mae-hae-royal-project-development-centre",
  );
  if (
    maeHae?.districtCode !== "5003" ||
    maeHae?.subdistrictCode !== "500305" ||
    maeHae?.representedAt !== "2023-06-14" ||
    !maeHae?.assertions.some(
      ({ field, sourceId, status }) =>
        field === "district_parent" &&
        sourceId === "RPF-MAE-HAE-DIRECT" &&
        status === "supported",
    ) ||
    data.registry.records.some(({ districtCode }) => districtCode === "5021")
  )
    failures.push("final district admission/gap evidence contract invalid");
  return failures;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = loadChiangMaiAttractions(process.cwd());
  const closure = loadChiangMaiAttractionsClosure(process.cwd());
  const failures = validateChiangMaiAttractionsClosure(data, closure);
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    "Chiang Mai attraction closure OK: 23 records, 25/25 reviewed, 2 documented gaps",
  );
}

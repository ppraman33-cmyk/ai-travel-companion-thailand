import { describe, expect, it } from "vitest";

import {
  findChiangMaiAttractionRuntimeLeakage,
  findProhibitedAttractionFiles,
  loadChiangMaiAttractions,
  validateChiangMaiAttractions,
} from "../../scripts/validate-chiang-mai-attractions-evidence.mjs";

const data = loadChiangMaiAttractions(process.cwd());

describe("Chiang Mai attractions research evidence baseline", () => {
  it("validates the complete fail-closed evidence contract", () => {
    expect(validateChiangMaiAttractions(data)).toEqual([]);
  });

  it("accounts for all 25 districts without equalizing or borrowing records", () => {
    expect(data.coverage.districts).toHaveLength(25);
    expect(data.registry.records).toHaveLength(23);
    expect(
      data.coverage.districts.filter(({ coverageStatus }) => coverageStatus === "gap"),
    ).toHaveLength(2);
    expect(
      data.coverage.districts.every(({ code, recordIds }) =>
        recordIds.every(
          (id) =>
            data.registry.records.find((record) => record.id === id)?.districtCode ===
            code,
        ),
      ),
    ).toBe(true);
  });

  it("preserves the two Batch 2 identities with direct parent evidence", () => {
    const admitted = new Map(
      data.registry.records.map((record) => [record.districtCode, record]),
    );
    expect([...admitted.keys()]).toEqual(expect.arrayContaining(["5008", "5012"]));
    for (const code of ["5008", "5012"]) {
      expect(admitted.get(code)?.assertions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "district_parent", status: "supported" }),
        ]),
      );
    }
    expect(admitted.get("5008")?.id).toBe("cm-attraction-5008-khun-khan-national-park");
    expect(admitted.get("5012")?.id).toBe("cm-attraction-5012-wiang-tha-kan");
  });

  it("keeps the final unresolved district explicit instead of equalizing coverage", () => {
    expect(
      data.coverage.districts
        .filter(({ coverageStatus }) => coverageStatus === "gap")
        .map(({ code }) => code),
    ).toEqual(["5020", "5021"]);
  });

  it("admits Batch 4 records only with official identity, authority and district evidence", () => {
    const expected = new Map([
      ["5010", "cm-attraction-5010-roi-jai-rak-garden"],
      ["5013", "cm-attraction-5013-maiiam-contemporary-art-museum"],
      ["5014", "cm-attraction-5014-thai-agricultural-culture-museum"],
      [
        "5022",
        "cm-attraction-5022-chiang-mai-royal-agricultural-research-centre-khun-wang",
      ],
    ]);
    for (const [districtCode, recordId] of expected) {
      const record = data.registry.records.find(({ id }) => id === recordId);
      expect(record).toMatchObject({
        districtCode,
        retrievedAt: "2026-08-25",
        rightsStatus: "facts_only_rights_pending",
        mediaRightsStatus: "not_assessed_no_media_downloaded",
        publicationEligibility: "blocked",
        coordinates: null,
        openingHoursStatus: "pending",
        admissionStatus: "pending",
        accessibilityStatus: "pending",
      });
      expect(record?.assertions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "identity", status: "supported" }),
          expect.objectContaining({
            field: "responsible_authority",
            status: "supported",
          }),
          expect.objectContaining({ field: "district_parent", status: "supported" }),
        ]),
      );
    }
  });

  it("uses direct owner locators without misclassifying private sources as government", () => {
    const sources = new Map(data.sources.sources.map((source) => [source.id, source]));
    const roiJaiRak = data.registry.records.find(
      ({ id }) => id === "cm-attraction-5010-roi-jai-rak-garden",
    );
    const museum = data.registry.records.find(
      ({ id }) => id === "cm-attraction-5014-thai-agricultural-culture-museum",
    );

    expect(sources.get("MAIIAM-VISIT-DIRECT")).toMatchObject({
      tier: 1,
      publisher: "MAIIAM Contemporary Art Museum",
      representedAt: null,
    });
    expect(sources.get("MFL-ROI-JAI-RAK-ANNUAL-2023")).toMatchObject({
      tier: 1,
      publisher: "Mae Fah Luang Foundation under Royal Patronage",
      representedAt: null,
    });
    expect(roiJaiRak?.assertions).toContainEqual({
      field: "responsible_authority",
      sourceId: "MFL-ROI-JAI-RAK-ANNUAL-2023",
      status: "supported",
    });
    expect(sources.get("MJU-MUSEUM-SAN-SAI-LOCATION")).toMatchObject({
      tier: 1,
      representedAt: "2017-06-01",
      retrievedAt: "2026-08-25",
    });
    expect(museum?.assertions).toContainEqual({
      field: "district_parent",
      sourceId: "MJU-MUSEUM-SAN-SAI-LOCATION",
      status: "supported",
    });
  });

  it("keeps service-only and boundary-spanning candidates outside the catalog", () => {
    expect(
      data.registry.records.some(
        ({ id }) => id === "cm-attraction-5021-doi-wiang-pha-public-service-unit",
      ),
    ).toBe(false);
    expect(
      data.sources.sources.some(({ id }) => id === "DNP-DOI-WIANG-PHA-VISITOR-SERVICE"),
    ).toBe(false);
    expect(data.exclusions.items.map(({ candidate }) => candidate)).toEqual(
      expect.arrayContaining([
        "Doi Dam viewpoint",
        "Doi Wiang Pha National Park area",
        "Ob Khan National Park area",
        "Pha Chor",
      ]),
    );
  });

  it("preserves all 18 records inherited from main without replacement", () => {
    const inherited = new Map([
      ["cm-attraction-5001-tha-phae-gate", "ประตูท่าแพ"],
      ["cm-attraction-5002-doi-inthanon-national-park", "อุทยานแห่งชาติดอยอินทนนท์"],
      ["cm-attraction-5004-pong-ang-hot-spring", "น้ำพุร้อนโป่งอ่าง"],
      [
        "cm-attraction-5005-huai-hong-khrai-centre",
        "ศูนย์ศึกษาการพัฒนาห้วยฮ่องไคร้อันเนื่องมาจากพระราชดำริ",
      ],
      ["cm-attraction-5006-kaeng-kuet", "แก่งกื้ด"],
      ["cm-attraction-5007-huai-tueng-thao", "ห้วยตึงเฒ่า"],
      ["cm-attraction-5008-khun-khan-national-park", "อุทยานแห่งชาติขุนขาน"],
      ["cm-attraction-5009-fang-hot-spring", "น้ำพุร้อนฝาง"],
      [
        "cm-attraction-5011-doi-mon-lan-station",
        "สถานีพัฒนาการเกษตรที่สูงตามพระราชดำริดอยม่อนล้าน",
      ],
      ["cm-attraction-5012-wiang-tha-kan", "เวียงท่ากาน"],
      ["cm-attraction-5015-chiang-mai-night-safari", "เชียงใหม่ไนท์ซาฟารี"],
      ["cm-attraction-5016-doi-bo-luang-forest-plantation", "สวนป่าดอยบ่อหลวง"],
      ["cm-attraction-5017-doi-tao-lake", "ทะเลสาบดอยเต่า"],
      ["cm-attraction-5018-doi-mon-chong", "ดอยม่อนจอง"],
      ["cm-attraction-5019-khu-pa-dom", "โบราณสถานกู่ป้าด้อม"],
      [
        "cm-attraction-5023-san-kamphaeng-hot-springs",
        "น้ำพุร้อนสันกำแพง อำเภอแม่ออน ตามพระราชดำริ",
      ],
      ["cm-attraction-5024-pha-chor", "ผาช่อ"],
      ["cm-attraction-5025-ban-wat-chan-forest-plantation", "สวนป่าบ้านวัดจันทร์"],
    ]);
    const current = new Map(
      data.registry.records.map(({ id, nameTh }) => [id, nameTh]),
    );
    expect(inherited.size).toBe(18);
    for (const [id, nameTh] of inherited) expect(current.get(id)).toBe(nameTh);
  });

  it("admits Batch 3 records only where one official source supports identity and district", () => {
    const expected = new Map([
      ["5005", "CM-PROVINCE-HUAI-HONG-KHRAI"],
      ["5016", "FIO-DOI-BO-LUANG-2135"],
      ["5019", "FAD-KHU-PA-DOM-52710"],
      ["5023", "CM-PROVINCE-SAN-KAMPHAENG-HOT-SPRINGS-13436"],
      ["5025", "FIO-BAN-WAT-CHAN-487"],
    ]);
    for (const [districtCode, sourceId] of expected) {
      const record = data.registry.records.find(
        (candidate) => candidate.districtCode === districtCode,
      );
      expect(record?.assertions).toEqual(
        expect.arrayContaining([
          { field: "identity", sourceId, status: "supported" },
          { field: "district_parent", sourceId, status: "supported" },
        ]),
      );
    }
  });

  it("uses the current represented date for the Mae On hot-spring assertion", () => {
    const record = data.registry.records.find(
      ({ id }) => id === "cm-attraction-5023-san-kamphaeng-hot-springs",
    );
    const source = data.sources.sources.find(
      ({ id }) => id === "CM-PROVINCE-SAN-KAMPHAENG-HOT-SPRINGS-13436",
    );
    expect(record?.representedAt).toBe("2025-06-13");
    expect(source).toMatchObject({
      representedAt: "2025-06-13",
      retrievedAt: "2026-08-22",
    });
  });

  it("keeps broad cross-district identities excluded while admitting specific sites", () => {
    const ids = data.registry.records.map(({ id }) => id);
    expect(ids).toContain("cm-attraction-5019-khu-pa-dom");
    expect(ids).toContain("cm-attraction-5016-doi-bo-luang-forest-plantation");
    expect(ids).not.toContain("cm-attraction-5019-wiang-kum-kam");
    expect(ids).not.toContain("cm-attraction-5016-ob-luang-national-park");
  });

  it("does not translate DNP names or collapse multi-district/locality evidence", () => {
    const khunKhan = data.registry.records.find(
      ({ id }) => id === "cm-attraction-5008-khun-khan-national-park",
    );
    const sources = new Map(data.sources.sources.map((source) => [source.id, source]));

    expect(khunKhan).toMatchObject({
      nameEn: null,
      englishNameStatus: "pending",
      representedAt: "2025-03-05",
    });
    expect(sources.get("DNP-KHUN-KHAN-NEWS-30591")).toMatchObject({
      representedAt: "2025-03-05",
    });
    expect(
      data.registry.records.some(({ id }) =>
        [
          "cm-attraction-5016-ob-luang-national-park",
          "cm-attraction-5019-wiang-kum-kam",
        ].includes(id),
      ),
    ).toBe(false);
    expect(data.exclusions.items.map(({ candidate }) => candidate)).toEqual(
      expect.arrayContaining([
        "Ob Luang National Park",
        "Wiang Kum Kam locality and individual monuments",
      ]),
    );
  });

  it("keeps every record rights-pending and publication-blocked", () => {
    expect(
      data.registry.records.every(
        (record) =>
          record.rightsStatus === "facts_only_rights_pending" &&
          record.mediaRightsStatus === "not_assessed_no_media_downloaded" &&
          record.publicationEligibility === "blocked" &&
          record.coordinates === null &&
          record.openingHoursStatus === "pending" &&
          record.admissionStatus === "pending" &&
          record.accessibilityStatus === "pending",
      ),
    ).toBe(true);
  });

  it("requires assertion-level evidence and a registered source for every record", () => {
    const sourceIds = new Set(data.sources.sources.map(({ id }) => id));
    expect(
      data.registry.records.every(
        (record) =>
          record.assertions.length > 0 &&
          record.sourceIds.length > 0 &&
          record.sourceIds.every((id) => sourceIds.has(id)),
      ),
    ).toBe(true);
  });

  it("binds Doi Inthanon to Chom Thong with direct and current supporting evidence", () => {
    const record = data.registry.records.find(
      ({ id }) => id === "cm-attraction-5002-doi-inthanon-national-park",
    );
    const sources = new Map(data.sources.sources.map((source) => [source.id, source]));

    expect(record).toMatchObject({
      districtCode: "5002",
      representedAt: "2026-01-15",
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
      publicationEligibility: "blocked",
      coordinates: null,
      openingHoursStatus: "pending",
      admissionStatus: "pending",
      accessibilityStatus: "pending",
    });
    expect(record?.assertions).toEqual(
      expect.arrayContaining([
        {
          field: "district_parent",
          sourceId: "TAT-CNX-DOI-INTHANON-DIRECT",
          status: "supported",
        },
        {
          field: "district_parent_supporting_current",
          sourceId: "CM-PROVINCE-NEWS-14279",
          status: "supported",
        },
      ]),
    );
    expect(sources.get("TAT-CNX-DOI-INTHANON-DIRECT")).toMatchObject({
      representedAt: null,
      retrievedAt: "2026-08-21",
    });
    expect(sources.get("CM-PROVINCE-NEWS-14279")).toMatchObject({
      representedAt: "2026-01-15",
      retrievedAt: "2026-08-21",
    });
  });

  it("does not leak research data into runtime paths or retain source binaries", () => {
    expect(findChiangMaiAttractionRuntimeLeakage(process.cwd())).toEqual([]);
    expect(findProhibitedAttractionFiles(process.cwd())).toEqual([]);
  });
});

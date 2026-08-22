import {
  chiangMaiCategoryCoverage,
  chiangMaiDistricts,
  getChiangMaiCoverageSummary,
} from "@/application/content/chiang-mai-evidence";

export function ChiangMaiCoverageDashboard() {
  const summary = getChiangMaiCoverageSummary();

  return (
    <section aria-labelledby="chiang-mai-coverage" className="mt-10">
      <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
        M3 evidence operations
      </p>
      <h2 className="mt-1 text-2xl font-bold" id="chiang-mai-coverage">
        Chiang Mai district coverage
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Internal evidence matrix. All real records remain evidence-pending and are
        excluded from traveler publication.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Official districts" value={summary.districtCount} />
        <Metric
          label="Verified identities"
          value={summary.verifiedDistrictIdentities}
        />
        <Metric label="Verified highlights" value={summary.verifiedHighlights} />
        <Metric label="Documented gaps" value={summary.documentedCoverageGaps} />
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Evidence and publication coverage for all Chiang Mai districts
          </caption>
          <thead className="bg-slate-50">
            <tr>
              {[
                "Code",
                "District",
                "Identity",
                "Highlight",
                "Media",
                "Publication",
                "Blockers",
              ].map((heading) => (
                <th className="px-4 py-3 font-semibold" key={heading} scope="col">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chiangMaiDistricts.map((district) => (
              <tr className="border-t border-slate-200" key={district.officialCode}>
                <td className="px-4 py-3 font-mono">{district.officialCode}</td>
                <th className="px-4 py-3" scope="row">
                  {district.englishName}
                  <span className="block font-normal text-slate-600">
                    {district.thaiName}
                  </span>
                </th>
                <td className="px-4 py-3">Verified</td>
                <td className="px-4 py-3">Coverage gap</td>
                <td className="px-4 py-3">Rights pending</td>
                <td className="px-4 py-3">Blocked</td>
                <td className="px-4 py-3">{district.coverageGaps.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
        Category registers ({chiangMaiCategoryCoverage.length}) remain empty until
        assertion-level primary evidence and district checks are complete. Emergency and
        media decisions require Founder review.
      </p>
    </section>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm text-slate-600">{label}</h3>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  );
}

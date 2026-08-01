"use client";

import { useState, type FormEvent } from "react";

import { getTrustedExternalMapUrl } from "@/application/traveler/external-map-links";
import {
  Button,
  Dialog,
  Field,
  Select,
  TextArea,
  Toast,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

import { useTravelerLocale } from "./locale-provider";

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

export function TravelerActions({
  placeId,
  emergency = false,
}: {
  readonly placeId: string;
  readonly emergency?: boolean;
}) {
  const { strings } = useTravelerLocale();
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [notice, setNotice] = useState<string>();

  async function ensureSession() {
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: document.documentElement.lang }),
      });
      if (!response.ok) return undefined;
      csrf = readCookie("atct_csrf");
    }
    return csrf;
  }

  async function toggleSaved() {
    const csrf = await ensureSession();
    if (!csrf)
      return setNotice(
        "Saving is unavailable until secure session persistence is configured.",
      );
    const response = await fetch(`/api/v1/saved-places${saved ? `/${placeId}` : ""}`, {
      method: saved ? "DELETE" : "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: saved ? undefined : JSON.stringify({ placeId }),
    });
    if (response.ok) setSaved(!saved);
    setNotice(
      response.ok
        ? saved
          ? "Removed from Saved."
          : "Saved to this anonymous session."
        : "The action could not be completed safely.",
    );
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const csrf = await ensureSession();
    if (!csrf)
      return setNotice(
        "Reporting is unavailable until secure session persistence is configured.",
      );
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/reports", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({
        placeId,
        category: form.get("category"),
        description: form.get("description"),
      }),
    });
    setReportOpen(false);
    setNotice(
      response.ok
        ? "Private report received. It cannot change publication automatically."
        : "The report could not be submitted safely.",
    );
  }

  return (
    <>
      {!emergency ? (
        <Button aria-pressed={saved} onClick={toggleSaved} variant="secondary">
          <span className="inline-flex items-center gap-2">
            <Icon name="heart" />
            {saved ? "Saved" : "Save"}
          </span>
        </Button>
      ) : null}
      <Button
        onClick={() => setMapOpen(true)}
        variant={emergency ? "danger" : "secondary"}
        disabled={emergency}
      >
        <span className="inline-flex items-center gap-2">
          <Icon name="map" />
          {strings.externalMaps}
        </span>
      </Button>
      <Button onClick={() => setReportOpen(true)} variant="ghost">
        <span className="inline-flex items-center gap-2">
          <Icon name="report" />
          {strings.reportInformation}
        </span>
      </Button>
      <Dialog
        onClose={() => setMapOpen(false)}
        open={mapOpen}
        sheet
        title={strings.leaveApp}
        closeLabel={strings.closeDialog}
      >
        <p className="text-slate-600">{strings.mapExplanation}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-4 font-bold text-white"
            href={getTrustedExternalMapUrl("google_maps")}
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Maps
          </a>
          <a
            className="inline-flex min-h-11 items-center rounded-xl border border-emerald-800 px-4 font-bold text-emerald-900"
            href={getTrustedExternalMapUrl("apple_maps")}
            rel="noopener noreferrer"
            target="_blank"
          >
            Apple Maps
          </a>
        </div>
      </Dialog>
      <Dialog
        onClose={() => setReportOpen(false)}
        open={reportOpen}
        title={strings.reportTitle}
        closeLabel={strings.closeDialog}
      >
        <form className="grid gap-4" onSubmit={submitReport}>
          <Field label={strings.reportQuestion}>
            <Select name="category" required>
              <option value="details">Place details</option>
              <option value="hours">Hours or dates</option>
              <option value="location">Location</option>
              <option value="safety">Safety-critical information</option>
            </Select>
          </Field>
          <Field label={strings.reportDetails} hint={strings.reportHint}>
            <TextArea name="description" minLength={5} maxLength={4000} required />
          </Field>
          <Button type="submit">{strings.submitReport}</Button>
        </form>
      </Dialog>
      {notice ? <Toast>{notice}</Toast> : null}
    </>
  );
}

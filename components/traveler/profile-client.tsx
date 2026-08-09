"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  preferenceOptions,
  summarizePreferences,
} from "@/application/traveler/preferences";
import {
  Button,
  ContentCard,
  Dialog,
  Field,
  Select,
  StatusState,
  TextArea,
  TextInput,
  Toast,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

interface Profile {
  id: string;
  name: string;
  description?: string;
  transportation?: string;
  travelStyle?: string;
  companions?: string;
  activityLevel?: string;
  mobilityNeeds?: string;
  budget?: string;
  interests: readonly string[];
  active: boolean;
}
interface Trip {
  id: string;
  title: string;
  travelerProfileId?: string;
  status: string;
}
const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

export function ProfileClient() {
  const [profiles, setProfiles] = useState<readonly Profile[] | null>(null);
  const [trips, setTrips] = useState<readonly Trip[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [editing, setEditing] = useState<Profile | "new" | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const [toast, setToast] = useState<string>();
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    const [profilesResponse, tripsResponse, savedResponse] = await Promise.all([
      fetch("/api/v1/profiles"),
      fetch("/api/v1/trips"),
      fetch("/api/v1/saved-places"),
    ]);
    if (!profilesResponse.ok) {
      setUnavailable(true);
      return;
    }
    const profileBody = (await profilesResponse.json()) as { data?: unknown };
    if (!Array.isArray(profileBody.data)) {
      setUnavailable(true);
      return;
    }
    setProfiles(profileBody.data as readonly Profile[]);
    if (tripsResponse.ok) {
      const tripBody = (await tripsResponse.json()) as { data?: unknown };
      setTrips(Array.isArray(tripBody.data) ? (tripBody.data as readonly Trip[]) : []);
    }
    if (savedResponse.ok) {
      const savedBody = (await savedResponse.json()) as { data?: unknown };
      setSavedCount(Array.isArray(savedBody.data) ? savedBody.data.length : 0);
    }
    setUnavailable(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function ensureCsrf() {
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: document.documentElement.lang }),
      });
      if (response.ok) csrf = readCookie("atct_csrf");
    }
    return csrf;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const csrf = await ensureCsrf();
    const response = await fetch(
      editing === "new" ? "/api/v1/profiles" : `/api/v1/profiles/${editing.id}`,
      {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description") || null,
          transportation: form.get("transportation") || null,
          travelStyle: form.get("travelStyle") || null,
          companions: form.get("companions") || null,
          activityLevel: form.get("activityLevel") || null,
          mobilityNeeds: form.get("mobilityNeeds") || null,
          budget: form.get("budget") || null,
          interests: String(form.get("interests") || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          active: editing === "new" && profiles?.length === 0,
        }),
      },
    );
    setToast(
      response.ok
        ? "Travel profile saved."
        : "Profile could not be saved. Check for a duplicate name.",
    );
    if (response.ok) {
      setEditing(null);
      await load();
    }
  }

  async function activate(profile: Profile) {
    const csrf = await ensureCsrf();
    const response = await fetch(`/api/v1/profiles/${profile.id}/activate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: "{}",
    });
    setToast(
      response.ok
        ? `${profile.name} is now active.`
        : "Active profile could not be changed.",
    );
    if (response.ok) await load();
  }

  async function remove(
    action: "block" | "detach" | "reassign",
    replacementProfileId?: string,
  ) {
    if (!deleting) return;
    const csrf = await ensureCsrf();
    const response = await fetch(`/api/v1/profiles/${deleting.id}`, {
      method: "DELETE",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ action, replacementProfileId }),
    });
    setToast(
      response.ok
        ? "Profile deleted safely."
        : "Profile is linked to a Trip. Reassign or detach those Trips first.",
    );
    if (response.ok) {
      setDeleting(null);
      await load();
    }
  }

  if (unavailable)
    return (
      <StatusState
        state="error"
        title="Travel profiles unavailable"
        description="Secure anonymous-session persistence is required."
      />
    );
  if (!profiles)
    return (
      <StatusState
        state="loading"
        title="Loading travel profiles"
        description="Checking session ownership…"
      />
    );
  const active = profiles.find((profile) => profile.active);
  return (
    <div className="grid gap-5">
      <ContentCard className="!bg-emerald-950 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">
              Active profile
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {active?.name ?? "No personalization"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-emerald-100">
              The active profile guides new deterministic recommendations. Existing
              Trips keep their linked profile. Editing a linked profile can change that
              Trip’s recommendations.
            </p>
          </div>
          <Button onClick={() => setEditing("new")}>Create profile</Button>
        </div>
      </ContentCard>
      {profiles.length === 0 ? (
        <StatusState
          state="empty"
          title="No travel profiles"
          description="You can still create Trips with No personalization."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => {
            const linked = trips.filter(
              (trip) =>
                trip.travelerProfileId === profile.id && trip.status !== "deleted",
            );
            return (
              <li key={profile.id}>
                <ContentCard className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {profile.active ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                            Active
                          </span>
                        ) : null}
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                          {linked.length} linked Trips
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-black">{profile.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {profile.description || "No description"}
                      </p>
                    </div>
                    <Icon className="size-7 text-emerald-700" name="user" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {summarizePreferences(profile).map((label) => (
                      <span
                        className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold"
                        key={label}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {!profile.active ? (
                      <Button onClick={() => activate(profile)} variant="secondary">
                        Set active
                      </Button>
                    ) : null}
                    <Button onClick={() => setEditing(profile)} variant="ghost">
                      Edit
                    </Button>
                    <Button onClick={() => setDeleting(profile)} variant="ghost">
                      Delete
                    </Button>
                  </div>
                </ContentCard>
              </li>
            );
          })}
        </ul>
      )}
      <ContentCard>
        <h2 className="text-xl font-bold">Traveler account overview</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase text-slate-500">Trips</dt>
            <dd className="mt-1 text-2xl font-black">{trips.length}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase text-slate-500">Saved</dt>
            <dd className="mt-1 text-2xl font-black">{savedCount}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase text-slate-500">AI status</dt>
            <dd className="mt-1 font-bold">Live AI disabled</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-emerald-800">
          <Link href="/trips">Manage Trips</Link>
          <Link href="/saved">View Saved</Link>
          <Link href="/help">Help, SOS and Service Car</Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          ATC 0.1.0 foundation build · deterministic recommendations only
        </p>
      </ContentCard>
      <ContentCard>
        <h2 className="text-xl font-bold">Privacy and session controls</h2>
        <p className="mt-2 text-sm text-slate-600">
          Profiles, Saved and Trips belong only to this anonymous session. Internal IDs
          are never displayed. Resetting onboarding changes only the local marker and
          never deletes server data.
        </p>
        <Button
          className="mt-4"
          onClick={() => {
            if (
              window.confirm(
                "Reset the local onboarding marker? Server profiles and Trips will remain.",
              )
            ) {
              localStorage.removeItem("atct-onboarding-completed");
              window.location.assign("/");
            }
          }}
          variant="secondary"
        >
          Reset onboarding
        </Button>
      </ContentCard>
      {editing ? (
        <ProfileDialog
          profile={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSubmit={save}
        />
      ) : null}
      {deleting ? (
        <DeleteDialog
          profile={deleting}
          profiles={profiles}
          linkedTrips={trips.filter(
            (trip) =>
              trip.travelerProfileId === deleting.id && trip.status !== "deleted",
          )}
          onClose={() => setDeleting(null)}
          onDelete={remove}
        />
      ) : null}
      {toast ? <Toast>{toast}</Toast> : null}
    </div>
  );
}

function ProfileDialog({
  profile,
  onClose,
  onSubmit,
}: {
  profile?: Profile;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog
      open
      title={profile ? "Edit travel profile" : "Create travel profile"}
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Profile name">
          <TextInput
            defaultValue={profile?.name ?? ""}
            maxLength={80}
            name="name"
            required
          />
        </Field>
        <Field label="Description">
          <TextArea
            defaultValue={profile?.description ?? ""}
            maxLength={500}
            name="description"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionField
            label="Transportation"
            name="transportation"
            value={profile?.transportation}
            options={preferenceOptions.transportation}
          />
          <OptionField
            label="Travel style"
            name="travelStyle"
            value={profile?.travelStyle}
            options={preferenceOptions.travelStyle}
          />
          <OptionField
            label="Companions"
            name="companions"
            value={profile?.companions}
            options={preferenceOptions.companions}
          />
          <OptionField
            label="Activity level"
            name="activityLevel"
            value={profile?.activityLevel}
            options={preferenceOptions.activityLevel}
          />
          <OptionField
            label="Budget"
            name="budget"
            value={profile?.budget}
            options={preferenceOptions.budget}
          />
        </div>
        <Field
          label="Accessibility or mobility needs (optional)"
          hint="Share only what is useful for travel planning."
        >
          <TextArea
            defaultValue={profile?.mobilityNeeds ?? ""}
            maxLength={300}
            name="mobilityNeeds"
          />
        </Field>
        <Field label="Interests (comma separated)">
          <TextInput
            defaultValue={profile?.interests.join(", ") ?? ""}
            name="interests"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </Dialog>
  );
}
function OptionField({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <Select defaultValue={value ?? ""} name={name}>
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
function DeleteDialog({
  profile,
  profiles,
  linkedTrips,
  onClose,
  onDelete,
}: {
  profile: Profile;
  profiles: readonly Profile[];
  linkedTrips: readonly Trip[];
  onClose: () => void;
  onDelete: (action: "block" | "detach" | "reassign", replacement?: string) => void;
}) {
  const [replacement, setReplacement] = useState("");
  return (
    <Dialog open title={`Delete ${profile.name}?`} onClose={onClose}>
      <p className="text-sm text-slate-600">
        {linkedTrips.length
          ? `${linkedTrips.length} active Trip(s) use this profile. Choose an explicit safe action.`
          : "This profile has no linked Trips."}
      </p>
      {linkedTrips.length ? (
        <div className="mt-4 grid gap-3">
          <Field label="Replacement profile">
            <Select
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
            >
              <option value="">Choose profile</option>
              {profiles
                .filter((candidate) => candidate.id !== profile.id)
                .map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
            </Select>
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!replacement}
              onClick={() => onDelete("reassign", replacement)}
            >
              Reassign and delete
            </Button>
            <Button onClick={() => onDelete("detach")} variant="secondary">
              Detach Trips and delete
            </Button>
          </div>
        </div>
      ) : (
        <Button className="mt-4" onClick={() => onDelete("block")} variant="danger">
          Delete profile
        </Button>
      )}
      <Button className="mt-4" onClick={onClose} variant="ghost">
        Cancel
      </Button>
    </Dialog>
  );
}

"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { demoItems, demoProvince } from "@/application/traveler/synthetic-content";
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

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

interface Trip {
  readonly id: string;
  readonly title: string;
  readonly status: "draft" | "active" | "completed" | "deleted";
  readonly startDate?: string;
  readonly endDate?: string;
  readonly notes?: string;
}

interface ItineraryDay {
  readonly id: string;
  readonly tripId: string;
  readonly plannedDate: string;
  readonly dayOrder: number;
  readonly notes?: string;
}

interface ItineraryItem {
  readonly id: string;
  readonly dayId: string;
  readonly order: number;
  readonly placeId?: string;
  readonly notes?: string;
  readonly plannedAt?: string;
  readonly aiGenerated: boolean;
}

type TripsState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly trips: readonly Trip[] }
  | { readonly status: "unavailable" };

const detailHref = (placeId: string): string | undefined => {
  const item = demoItems.find((entry) => entry.id === placeId);
  if (!item) return undefined;
  return `/thailand/${demoProvince.region}/${demoProvince.slug}/${item.category}/${item.slug}`;
};

const resolveDemoItem = (placeId: string) =>
  demoItems.find((entry) => entry.id === placeId);

const formatDate = (date?: string): string => {
  if (!date) return "Unscheduled";
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const formatDateShort = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
};

export function TripsClient() {
  const [tripsState, setTripsState] = useState<TripsState>({ status: "loading" });
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [addDayDialog, setAddDayDialog] = useState(false);
  const [addItemDialog, setAddItemDialog] = useState<{ dayId: string } | null>(null);
  const [toast, setToast] = useState<string>();
  const [itineraryLoading, setItineraryLoading] = useState(false);

  const refreshTrips = useCallback(async () => {
    const response = await fetch("/api/v1/trips", { credentials: "same-origin" });
    if (response.ok) {
      const body = (await response.json()) as { data: readonly Trip[] };
      const list = body.data.filter((trip) => trip.status !== "deleted");
      setTripsState({ status: "ready", trips: list });
      return list;
    }
    setTripsState({ status: "unavailable" });
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/trips", { credentials: "same-origin" })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("unavailable")),
      )
      .then((body: { data: readonly Trip[] }) => {
        if (cancelled) return;
        const list = body.data.filter((trip) => trip.status !== "deleted");
        setTripsState({ status: "ready", trips: list });
      })
      .catch(() => {
        if (!cancelled) setTripsState({ status: "unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadItinerary = useCallback(async (tripId: string) => {
    setItineraryLoading(true);
    try {
      const [daysRes, itemsRes] = await Promise.all([
        fetch(`/api/v1/trips/${tripId}/days`, { credentials: "same-origin" }),
        fetch(`/api/v1/trips/${tripId}/items`, { credentials: "same-origin" }),
      ]);
      if (daysRes.ok) {
        const daysBody = (await daysRes.json()) as { data: readonly ItineraryDay[] };
        setDays([...daysBody.data].sort((a, b) => a.dayOrder - b.dayOrder));
      } else {
        setDays([]);
      }
      if (itemsRes.ok) {
        const itemsBody = (await itemsRes.json()) as { data: readonly ItineraryItem[] };
        setItems([...itemsBody.data].sort((a, b) => a.order - b.order));
      } else {
        setItems([]);
      }
    } catch {
      setDays([]);
      setItems([]);
    }
    setItineraryLoading(false);
  }, []);

  const selectTrip = useCallback(
    (trip: Trip) => {
      setActiveTrip(trip);
      void loadItinerary(trip.id);
    },
    [loadItinerary],
  );

  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const session = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: document.documentElement.lang }),
      });
      if (session.ok) csrf = readCookie("atct_csrf");
    }
    const response = await fetch("/api/v1/trips", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ title: form.get("title") }),
    });
    if (response.ok) {
      setToast("Trip created.");
      const list = await refreshTrips();
      const created = (await response.json()) as { data: Trip };
      const newTrip = list?.find((t) => t.id === created.data.id) ?? created.data;
      selectTrip(newTrip);
      event.currentTarget.reset();
    } else {
      setToast("Trip could not be created.");
    }
  }

  async function saveTripEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTrip) return;
    const editingTripId = editingTrip.id;
    const form = new FormData(event.currentTarget);
    const csrf = readCookie("atct_csrf");
    const response = await fetch(`/api/v1/trips/${editingTripId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({
        title: form.get("title"),
        status: form.get("status") ?? editingTrip.status,
        startDate: form.get("startDate") || undefined,
        endDate: form.get("endDate") || undefined,
        notes: form.get("notes") || undefined,
      }),
    });
    if (response.ok) {
      setToast("Trip updated.");
      setEditingTrip(null);
      const list = await refreshTrips();
      if (list && activeTrip) {
        const updated = list.find((t) => t.id === activeTrip.id);
        if (updated) {
          setActiveTrip(updated);
          void loadItinerary(updated.id);
        }
      }
    } else {
      setToast("Trip could not be updated.");
    }
  }

  async function deleteTrip(trip: Trip) {
    const csrf = readCookie("atct_csrf");
    const response = await fetch(`/api/v1/trips/${trip.id}`, {
      method: "DELETE",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
    });
    if (response.ok) {
      setToast(`"${trip.title}" was deleted.`);
      if (activeTrip?.id === trip.id) {
        setActiveTrip(null);
        setDays([]);
        setItems([]);
      }
      await refreshTrips();
    } else {
      setToast("Trip could not be deleted.");
    }
  }

  async function addDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTrip) return;
    const form = new FormData(event.currentTarget);
    const csrf = readCookie("atct_csrf");
    const dayOrder = days.length;
    const response = await fetch(`/api/v1/trips/${activeTrip.id}/days`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({
        plannedDate: form.get("plannedDate"),
        dayOrder,
        notes: form.get("notes") || undefined,
      }),
    });
    if (response.ok) {
      setToast("Day added.");
      setAddDayDialog(false);
      await loadItinerary(activeTrip.id);
    } else {
      setToast("Day could not be added.");
    }
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addItemDialog || !activeTrip) return;
    const tripId = activeTrip.id;
    const form = new FormData(event.currentTarget);
    const csrf = readCookie("atct_csrf");
    const dayItems = items.filter((i) => i.dayId === addItemDialog.dayId);
    const order = dayItems.length;
    const response = await fetch(`/api/v1/trips/${tripId}/items`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({
        dayId: addItemDialog.dayId,
        order,
        placeId: form.get("placeId"),
        notes: form.get("notes") || undefined,
        plannedAt: form.get("plannedAt") || undefined,
        aiGenerated: false,
      }),
    });
    if (response.ok) {
      setToast("Item added to itinerary.");
      setAddItemDialog(null);
      await loadItinerary(tripId);
    } else {
      setToast("Item could not be added.");
    }
  }

  async function removeItem(itemId: string) {
    if (!activeTrip) return;
    const csrf = readCookie("atct_csrf");
    const response = await fetch(`/api/v1/trips/${activeTrip.id}/items/${itemId}`, {
      method: "DELETE",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
    });
    if (response.ok) {
      setToast("Item removed.");
      await loadItinerary(activeTrip.id);
    }
  }

  async function moveItem(itemId: string, direction: -1 | 1) {
    if (!activeTrip) return;
    const original = [...items];
    const item = original.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const dayItems = original
      .filter((candidate) => candidate.dayId === item.dayId)
      .sort((a, b) => a.order - b.order);
    const index = dayItems.findIndex((candidate) => candidate.id === itemId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= dayItems.length) return;
    [dayItems[index], dayItems[target]] = [dayItems[target], dayItems[index]];
    const reordered = dayItems.map((candidate, order) => ({ ...candidate, order }));
    setItems((current) => [
      ...current.filter((candidate) => candidate.dayId !== item.dayId),
      ...reordered,
    ]);
    const csrf = readCookie("atct_csrf");
    const response = await fetch(
      `/api/v1/trips/${activeTrip.id}/days/${item.dayId}/reorder`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
        body: JSON.stringify({ orderedItemIds: reordered.map((entry) => entry.id) }),
      },
    );
    if (!response.ok) {
      setItems(original);
      setToast("Itinerary order could not be saved.");
      return;
    }
    await loadItinerary(activeTrip.id);
    setToast("Itinerary order saved.");
  }

  const isReady = tripsState.status === "ready";
  const hasTrips = isReady && tripsState.trips.length > 0;
  const totalItems = items.length;
  const totalDays = days.length;
  const statusLabels: Record<string, string> = {
    draft: "Draft",
    active: "Active",
    completed: "Completed",
  };

  return (
    <div className="grid gap-5">
      <ContentCard>
        <h2 className="text-xl font-bold">Create a trip</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem_10rem_auto]"
          onSubmit={createTrip}
        >
          <Field label="Trip name">
            <TextInput maxLength={120} name="title" required />
          </Field>
          <Field label="Start date">
            <TextInput name="start" type="date" />
          </Field>
          <Field label="End date">
            <TextInput name="end" type="date" />
          </Field>
          <Button className="self-end" type="submit">
            Create trip
          </Button>
        </form>
      </ContentCard>

      {tripsState.status === "loading" ? (
        <StatusState
          state="loading"
          title="Loading your trips"
          description="Checking anonymous-session ownership…"
        />
      ) : tripsState.status === "unavailable" ? (
        <StatusState
          state="error"
          title="Trips are unavailable"
          description="Trip creation still works. Nothing is stored outside the secure session service."
        />
      ) : hasTrips ? (
        <ContentCard>
          <h2 className="text-xl font-bold">Your trips</h2>
          <ul className="mt-4 grid gap-3">
            {tripsState.trips.map((trip) => (
              <li
                className={
                  "flex items-center gap-3 rounded-xl border p-4 transition" +
                  (activeTrip?.id === trip.id
                    ? " border-emerald-600 bg-emerald-50"
                    : " border-slate-200 hover:border-emerald-300")
                }
                key={trip.id}
              >
                <button
                  aria-pressed={activeTrip?.id === trip.id}
                  className="min-w-0 flex-1 text-left"
                  onClick={() => selectTrip(trip)}
                  type="button"
                >
                  <strong className="block truncate">{trip.title}</strong>
                  <small className="text-slate-500">
                    {statusLabels[trip.status] ?? trip.status}
                    {" · "}
                    {formatDate(trip.startDate)}
                    {trip.endDate ? ` → ${formatDate(trip.endDate)}` : ""}
                  </small>
                </button>
                <Button
                  aria-label={`Edit trip ${trip.title}`}
                  onClick={() => setEditingTrip(trip)}
                  variant="ghost"
                >
                  Edit
                </Button>
                <Button
                  aria-label={`Delete trip ${trip.title}`}
                  onClick={() => deleteTrip(trip)}
                  variant="ghost"
                >
                  ×
                </Button>
              </li>
            ))}
          </ul>
        </ContentCard>
      ) : (
        <StatusState
          state="empty"
          title="No trips yet"
          description="Create a session-owned trip to unlock the itinerary interaction foundation."
        />
      )}

      {activeTrip ? (
        <ContentCard>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                  {statusLabels[activeTrip.status] ?? activeTrip.status}
                </span>
                {totalDays > 0 && (
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-900">
                    {totalDays} {totalDays === 1 ? "day" : "days"}
                  </span>
                )}
                {totalItems > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    {totalItems} {totalItems === 1 ? "stop" : "stops"}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-xl font-bold">{activeTrip.title}</h2>
              <p className="text-sm text-slate-500">
                {formatDate(activeTrip.startDate)}
                {activeTrip.endDate ? ` → ${formatDate(activeTrip.endDate)}` : ""}
              </p>
              {activeTrip.notes ? (
                <p className="mt-3 text-sm text-slate-600">{activeTrip.notes}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditingTrip(activeTrip)} variant="secondary">
                Edit
              </Button>
              <Button onClick={() => setAddDayDialog(true)}>Add day</Button>
            </div>
          </div>

          {itineraryLoading ? (
            <div className="mt-6 grid gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-slate-100"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : days.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="font-semibold">No itinerary days yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a day to start building your timeline.
              </p>
              <Button className="mt-4" onClick={() => setAddDayDialog(true)}>
                Add first day
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6">
              {days.map((day) => {
                const dayItems = items.filter((i) => i.dayId === day.id);
                return (
                  <div key={day.id}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">
                        Day {day.dayOrder + 1}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {formatDateShort(day.plannedDate)}
                        </span>
                      </h3>
                      <Button
                        onClick={() => setAddItemDialog({ dayId: day.id })}
                        variant="ghost"
                      >
                        + Add stop
                      </Button>
                    </div>
                    {day.notes ? (
                      <p className="mt-1 text-sm text-slate-500">{day.notes}</p>
                    ) : null}
                    {dayItems.length === 0 ? (
                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                        No stops planned for this day.
                      </p>
                    ) : (
                      <ol className="mt-3 grid gap-2">
                        {dayItems.map((item, index) => {
                          const demo = item.placeId
                            ? resolveDemoItem(item.placeId)
                            : undefined;
                          const href = item.placeId
                            ? detailHref(item.placeId)
                            : undefined;
                          return (
                            <li
                              className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                              key={item.id}
                            >
                              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {item.plannedAt ? (
                                    <span className="text-xs font-bold text-emerald-700">
                                      {item.plannedAt}
                                    </span>
                                  ) : null}
                                  {demo ? (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                      {demo.category}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 font-semibold">
                                  {demo?.name ?? "Unknown place"}
                                </p>
                                {item.notes ? (
                                  <p className="mt-1 text-sm text-slate-500">
                                    {item.notes}
                                  </p>
                                ) : null}
                                {href ? (
                                  <a
                                    className="mt-1 inline-block text-xs font-bold text-emerald-700 hover:underline"
                                    href={href}
                                    rel="noopener noreferrer"
                                  >
                                    View details →
                                  </a>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button
                                  aria-label="Move up"
                                  disabled={index === 0}
                                  onClick={() => moveItem(item.id, -1)}
                                  variant="ghost"
                                >
                                  ↑
                                </Button>
                                <Button
                                  aria-label="Move down"
                                  disabled={index === dayItems.length - 1}
                                  onClick={() => moveItem(item.id, 1)}
                                  variant="ghost"
                                >
                                  ↓
                                </Button>
                                <Button
                                  aria-label="Remove stop"
                                  onClick={() => removeItem(item.id)}
                                  variant="ghost"
                                >
                                  ×
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ContentCard>
      ) : null}

      {editingTrip ? (
        <Dialog onClose={() => setEditingTrip(null)} open title="Edit trip">
          <form className="grid gap-4" onSubmit={saveTripEdit}>
            <Field label="Trip name">
              <TextInput
                defaultValue={editingTrip.title}
                maxLength={120}
                name="title"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date">
                <TextInput
                  defaultValue={editingTrip.startDate ?? ""}
                  name="startDate"
                  type="date"
                />
              </Field>
              <Field label="End date">
                <TextInput
                  defaultValue={editingTrip.endDate ?? ""}
                  name="endDate"
                  type="date"
                />
              </Field>
            </div>
            <Field label="Status">
              <Select defaultValue={editingTrip.status} name="status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </Select>
            </Field>
            <Field label="Notes">
              <TextArea
                defaultValue={editingTrip.notes ?? ""}
                maxLength={5000}
                name="notes"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setEditingTrip(null)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Dialog>
      ) : null}

      {addDayDialog ? (
        <Dialog onClose={() => setAddDayDialog(false)} open title="Add itinerary day">
          <form className="grid gap-4" onSubmit={addDay}>
            <Field label="Date">
              <TextInput name="plannedDate" required type="date" />
            </Field>
            <Field label="Day notes (optional)">
              <TextArea maxLength={2000} name="notes" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setAddDayDialog(false)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button type="submit">
                <span className="inline-flex items-center gap-2">
                  <Icon name="trip" />
                  Add day
                </span>
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}

      {addItemDialog ? (
        <Dialog
          onClose={() => setAddItemDialog(null)}
          open
          title="Add stop to itinerary"
        >
          <form className="grid gap-4" onSubmit={addItem}>
            <Field label="Place">
              <Select name="placeId" required>
                {demoItems
                  .filter((item) => item.category !== "emergency")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Planned time (optional)">
              <TextInput name="plannedAt" type="time" />
            </Field>
            <Field label="Notes (optional)">
              <TextArea maxLength={1000} name="notes" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setAddItemDialog(null)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button type="submit">Add stop</Button>
            </div>
          </form>
        </Dialog>
      ) : null}

      {toast ? <Toast>{toast}</Toast> : null}
    </div>
  );
}

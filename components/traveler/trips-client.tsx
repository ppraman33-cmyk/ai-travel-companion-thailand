"use client";

import { useState, type FormEvent } from "react";

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

type DraftItem = { id: number; title: string; notes: string };

export function TripsClient() {
  const [message, setMessage] = useState(
    "Create a secure anonymous session only when you save your first trip.",
  );
  const [created, setCreated] = useState(false);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [dialog, setDialog] = useState(false);
  const [toast, setToast] = useState<string>();

  const createTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const session = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: document.documentElement.lang }),
      });
      if (!session.ok) {
        setMessage(
          "Trip saving is unavailable until secure session persistence is configured.",
        );
        return;
      }
      csrf = readCookie("atct_csrf");
    }
    const response = await fetch("/api/v1/trips", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ title: form.get("title") }),
    });
    setMessage(
      response.ok
        ? "Trip created for this anonymous session."
        : "Trip could not be created safely.",
    );
    setCreated(response.ok);
    if (response.ok) event.currentTarget.reset();
  };

  function addDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setItems((current) => [
      ...current,
      {
        id: Date.now(),
        title: String(form.get("item")),
        notes: String(form.get("notes") ?? ""),
      },
    ]);
    setDialog(false);
    setToast(
      "Added to the itinerary UI draft. Server day persistence remains evidence-gated.",
    );
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

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
        <p aria-live="polite" className="mt-4 text-sm text-slate-600" role="status">
          {message}
        </p>
      </ContentCard>
      {!created ? (
        <StatusState
          state="empty"
          title="No active itinerary"
          description="Create a session-owned trip to unlock the itinerary interaction foundation."
        />
      ) : (
        <ContentCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-700">Day 1</p>
              <h2 className="text-xl font-bold">Itinerary foundation</h2>
            </div>
            <Button onClick={() => setDialog(true)}>Add item</Button>
          </div>
          {items.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              No items yet. Add a synthetic catalog idea or traveler note.
            </p>
          ) : (
            <ol className="mt-5 grid gap-3">
              {items.map((item, index) => (
                <li
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                  key={item.id}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-900">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block">{item.title}</strong>
                    {item.notes ? (
                      <small className="text-slate-500">{item.notes}</small>
                    ) : null}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      aria-label={`Move ${item.title} earlier`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      variant="ghost"
                    >
                      ↑
                    </Button>
                    <Button
                      aria-label={`Move ${item.title} later`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      variant="ghost"
                    >
                      ↓
                    </Button>
                    <Button
                      aria-label={`Remove ${item.title}`}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((entry) => entry.id !== item.id),
                        )
                      }
                      variant="ghost"
                    >
                      ×
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </ContentCard>
      )}
      <Dialog
        onClose={() => setDialog(false)}
        open={dialog}
        sheet
        title="Add itinerary item"
      >
        <form className="grid gap-4" onSubmit={addDraft}>
          <Field label="Synthetic catalog idea">
            <Select name="item">
              <option>Lantern Garden</option>
              <option>River Leaf Kitchen</option>
              <option>Moon Market</option>
            </Select>
          </Field>
          <Field label="Traveler notes">
            <TextArea maxLength={1000} name="notes" />
          </Field>
          <Button type="submit">
            <span className="inline-flex items-center gap-2">
              <Icon name="trip" />
              Add to Day 1
            </span>
          </Button>
        </form>
      </Dialog>
      {toast ? <Toast>{toast}</Toast> : null}
    </div>
  );
}

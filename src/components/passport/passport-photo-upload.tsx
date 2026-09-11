"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { preparePassportPhoto } from "@/features/passport/passport-photo";
import {
  readPassportProfile,
  savePassportProfile,
} from "@/features/passport/vehicle-passport";

export function PassportPhotoUpload({
  vehicleId,
  photo,
  onSaved,
}: {
  vehicleId: string;
  photo?: string;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const locked = useRef(false);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  async function upload(file: File) {
    if (locked.current) return;
    locked.current = true;
    const request = ++generation.current;
    setBusy(true);
    setMessage("");
    try {
      const photoDataUrl = await preparePassportPhoto(file);
      if (request !== generation.current) return;
      const profile = readPassportProfile(vehicleId, localStorage);
      savePassportProfile(
        {
          vehicleId,
          publishOwnerDetails: false,
          includeFullVin: false,
          ...profile,
          photoDataUrl,
          publishPhoto: false,
        },
        localStorage,
      );
      onSaved();
      setMessage(
        "Photo saved. Location metadata was removed. Enable photo sharing in Document identity and save the details to include it in new Passport exports and public links.",
      );
    } catch (error) {
      if (request === generation.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not save your photo. Check browser storage and try again.",
        );
    } finally {
      locked.current = false;
      if (request === generation.current) setBusy(false);
    }
  }
  function remove() {
    try {
      const profile = readPassportProfile(vehicleId, localStorage);
      if (profile)
        savePassportProfile(
          { ...profile, photoDataUrl: undefined, publishPhoto: false },
          localStorage,
        );
      onSaved();
      setMessage(
        "Photo removed from new exports. Revoke older public links if they contain this photo.",
      );
    } catch {
      setMessage("Could not remove your photo. Try again.");
    }
  }
  return (
    <section
      aria-labelledby="passport-photo-title"
      className="no-print mt-5 rounded-[2rem] border border-white/15 bg-[#111111] p-5 sm:p-8"
    >
      <h2 id="passport-photo-title" className="text-2xl font-medium">
        Your car. Your Passport.
      </h2>
      <p className="my-4 max-w-2xl text-sm leading-6 text-white/65">
        Add a photo you own. It is resized on your device before saving with
        your private garage profile. Check for visible number plates, people or
        addresses before sharing. Original photo files are not uploaded.
      </p>
      {photo && (
        <div className="relative mb-4 aspect-video max-w-lg overflow-hidden rounded-xl">
          <Image
            src={photo}
            alt="Your saved Passport photo"
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-contain"
          />
        </div>
      )}
      <FileDropzone
        label={photo ? "Replace Passport photo" : "Add Passport photo"}
        description="JPEG, PNG or WebP · up to 10 MB · compressed to under 350 KB of stored text"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onFile={upload}
      />
      {photo && (
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="mt-3 min-h-11 rounded-xl border border-white/20 px-4 text-sm disabled:opacity-40"
        >
          Remove saved photo
        </button>
      )}
      <p role="status" className="mt-3 text-sm leading-6 text-white/70">
        {busy ? "Preparing your photo…" : message}
      </p>
    </section>
  );
}

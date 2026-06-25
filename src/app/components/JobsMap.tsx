import { useEffect, useMemo, useState } from "react";
import { APIProvider, InfoWindow, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { Crosshair, MapPin } from "lucide-react";
import type { Job } from "../../types";
import { JobMapPreviewCard } from "./JobMapPreviewCard";
import {
  getPublicMapCoordinates,
  JAKARTA_CENTER,
  jobMapPosition,
} from "../../lib/jobFilters";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function fitJobsOnMap(
  map: google.maps.Map,
  jobs: Job[],
  padding = 48,
) {
  const coords = jobs.map(getPublicMapCoordinates).filter((c): c is { lat: number; lng: number } => c !== null);
  if (coords.length === 0) {
    map.panTo(JAKARTA_CENTER);
    map.setZoom(11);
    return;
  }
  if (coords.length === 1) {
    map.panTo(coords[0]);
    map.setZoom(13);
    return;
  }
  const bounds = new google.maps.LatLngBounds();
  coords.forEach((c) => bounds.extend(c));
  map.fitBounds(bounds, padding);
}

function MapViewController({
  jobs,
  previewId,
  recenterRequest,
}: {
  jobs: Job[];
  previewId: string | null;
  recenterRequest: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (previewId) {
      const job = jobs.find((j) => j.id === previewId);
      const coords = job ? getPublicMapCoordinates(job) : null;
      if (coords) {
        map.panTo(coords);
        map.setZoom(14);
      }
      return;
    }

    fitJobsOnMap(map, jobs);
  }, [map, jobs, previewId]);

  useEffect(() => {
    if (!map || recenterRequest === 0) return;

    if (previewId) {
      const job = jobs.find((j) => j.id === previewId);
      const coords = job ? getPublicMapCoordinates(job) : null;
      if (coords) {
        map.panTo(coords);
        map.setZoom(14);
      }
      return;
    }

    fitJobsOnMap(map, jobs);
  }, [map, jobs, previewId, recenterRequest]);

  return null;
}

function JobMarkers({
  jobs,
  onPinClick,
}: {
  jobs: Job[];
  onPinClick: (id: string) => void;
}) {
  const pins = useMemo(
    () =>
      jobs
        .map((job) => ({ job, coords: getPublicMapCoordinates(job) }))
        .filter((p): p is { job: Job; coords: { lat: number; lng: number } } => p.coords !== null),
    [jobs],
  );

  return (
    <>
      {pins.map(({ job, coords }) => (
        <Marker
          key={job.id}
          position={coords}
          onClick={() => onPinClick(job.id)}
          title={job.title}
        />
      ))}
    </>
  );
}

function MapPreviewLayer({
  jobs,
  previewId,
  onPreviewClose,
  onViewTask,
}: {
  jobs: Job[];
  previewId: string | null;
  onPreviewClose: () => void;
  onViewTask: (id: string) => void;
}) {
  const previewJob = jobs.find((j) => j.id === previewId) ?? null;
  const coords = previewJob ? getPublicMapCoordinates(previewJob) : null;

  if (!previewJob || !coords) return null;

  return (
    <InfoWindow
      position={coords}
      pixelOffset={[0, -36]}
      onCloseClick={onPreviewClose}
    >
      <JobMapPreviewCard
        job={previewJob}
        onViewTask={() => onViewTask(previewJob.id)}
      />
    </InfoWindow>
  );
}

function MapClickCloser({ active, onClose }: { active: boolean; onClose: () => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !active) return;
    const listener = map.addListener("click", onClose);
    return () => listener.remove();
  }, [map, active, onClose]);

  return null;
}

/** Fallback when no API key — static OSM tile + CSS pins */
function OsmJobsMapFallback({
  jobs,
  previewId,
  onPinClick,
  onPreviewClose,
  onViewTask,
}: {
  jobs: Job[];
  previewId: string | null;
  onPinClick: (id: string) => void;
  onPreviewClose: () => void;
  onViewTask: (id: string) => void;
}) {
  const pins = jobs
    .map((job) => ({ job, pos: jobMapPosition(job) }))
    .filter((p): p is { job: Job; pos: { left: string; top: string } } => p.pos !== null);
  const previewJob = jobs.find((j) => j.id === previewId) ?? null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#dce8e4]">
      <img
        src="https://tile.openstreetmap.org/11/1636/1055.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#F5F1E8]/30 pointer-events-none" />
      {pins.map(({ job, pos }) => {
        const active = previewId === job.id;
        return (
          <button
            key={job.id}
            type="button"
            onClick={() => onPinClick(job.id)}
            className="absolute -translate-x-1/2 -translate-y-full z-10"
            style={{ left: pos.left, top: pos.top }}
            title={job.title}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 ${
                active ? "bg-[#2E5090] border-white scale-125" : "bg-white border-[#2E5090]"
              }`}
            >
              <MapPin size={13} className={active ? "text-white" : "text-[#2E5090]"} fill={active ? "currentColor" : "none"} />
            </div>
          </button>
        );
      })}

      {previewJob && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 pointer-events-none">
          <div className="relative pointer-events-auto">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-[#c8dfd8]" />
            <div className="bg-white rounded-2xl shadow-xl border border-[#c8dfd8] p-4">
              <button
                type="button"
                onClick={onPreviewClose}
                className="absolute top-2 right-2 w-6 h-6 text-[#7a9a8f] hover:text-[#1a2d4a] text-[18px] leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
              <JobMapPreviewCard
                job={previewJob}
                onViewTask={() => onViewTask(previewJob.id)}
              />
            </div>
          </div>
        </div>
      )}

      <p className="absolute bottom-2 right-3 text-[10px] text-[#7a9a8f] bg-white/80 px-2 py-0.5 rounded-full z-10">
        © OpenStreetMap (tambahkan VITE_GOOGLE_MAPS_API_KEY)
      </p>
    </div>
  );
}

export function JobsMap({
  jobs,
  previewId,
  onPinClick,
  onPreviewClose,
  onViewTask,
}: {
  jobs: Job[];
  previewId: string | null;
  onPinClick: (id: string) => void;
  onPreviewClose: () => void;
  onViewTask: (id: string) => void;
}) {
  const [recenterRequest, setRecenterRequest] = useState(0);
  const pinCount = jobs.filter((j) => getPublicMapCoordinates(j) !== null).length;

  if (!MAPS_KEY) {
    return (
      <OsmJobsMapFallback
        jobs={jobs}
        previewId={previewId}
        onPinClick={onPinClick}
        onPreviewClose={onPreviewClose}
        onViewTask={onViewTask}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={MAPS_KEY}>
        <Map
          defaultCenter={JAKARTA_CENTER}
          defaultZoom={11}
          gestureHandling="greedy"
          fullscreenControl={false}
          streetViewControl
          mapTypeControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <MapViewController jobs={jobs} previewId={previewId} recenterRequest={recenterRequest} />
          <JobMarkers jobs={jobs} onPinClick={onPinClick} />
          <MapClickCloser active={!!previewId} onClose={onPreviewClose} />
          <MapPreviewLayer
            jobs={jobs}
            previewId={previewId}
            onPreviewClose={onPreviewClose}
            onViewTask={onViewTask}
          />
        </Map>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute right-4 bottom-10 pointer-events-auto">
            <button
              type="button"
              onClick={() => setRecenterRequest((n) => n + 1)}
              className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F5F1E8] border border-[#b8d4c8]"
              title="Pusatkan peta"
            >
              <Crosshair size={15} className="text-[#3d6b5e]" />
            </button>
          </div>

          <div className="absolute top-3 left-3 text-[10px] text-[#3d6b5e] bg-white/90 px-2.5 py-1 rounded-full z-10 pointer-events-none border border-[#c8dfd8]">
            Lokasi perkiraan · privasi dilindungi
          </div>

          <div className="absolute bottom-2 right-3 text-[10px] text-[#7a9a8f] bg-white/80 px-2 py-0.5 rounded-full">
            Google Maps
          </div>

          {pinCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[13px] text-[#3d6b5e] font-semibold bg-white/90 px-4 py-2 rounded-full shadow">
                Tidak ada pekerjaan dengan lokasi di peta
              </p>
            </div>
          )}
        </div>
      </APIProvider>
    </div>
  );
}

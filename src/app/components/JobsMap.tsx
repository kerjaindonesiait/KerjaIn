import { useEffect, useMemo, useState } from "react";
import { APIProvider, InfoWindow, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { Crosshair } from "lucide-react";
import type { Job } from "../../types";
import { JobMapPreviewCard } from "./JobMapPreviewCard";
import {
  resolveMapPinPositions,
  coordsToMapPosition,
  JAKARTA_CENTER,
} from "../../lib/jobFilters";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const MAPS_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

const KERJAIN_PIN = "/map-pins/kerjain-pin.png";
const KERJAIN_PIN_SELECTED = "/map-pins/kerjain-pin-selected.png";

function kerjainMapPinIcon(selected: boolean): google.maps.Icon {
  const size = selected ? 52 : 42;
  return {
    url: selected ? KERJAIN_PIN_SELECTED : KERJAIN_PIN,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  };
}

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const resize = () => {
      google.maps.event.trigger(map, "resize");
    };

    resize();
    const t = window.setTimeout(resize, 100);
    window.addEventListener("resize", resize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", resize);
    };
  }, [map]);

  return null;
}

function fitJobsOnMap(
  map: google.maps.Map,
  pinPositions: Map<string, { lat: number; lng: number }>,
  padding = 48,
) {
  const coords = [...pinPositions.values()];
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
  pinPositions,
  previewId,
  recenterRequest,
}: {
  jobs: Job[];
  pinPositions: Map<string, { lat: number; lng: number }>;
  previewId: string | null;
  recenterRequest: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (previewId) {
      const coords = pinPositions.get(previewId);
      if (coords) {
        map.panTo(coords);
        map.setZoom(14);
      }
      return;
    }

    fitJobsOnMap(map, pinPositions);
  }, [map, jobs, pinPositions, previewId]);

  useEffect(() => {
    if (!map || recenterRequest === 0) return;

    if (previewId) {
      const coords = pinPositions.get(previewId);
      if (coords) {
        map.panTo(coords);
        map.setZoom(14);
      }
      return;
    }

    fitJobsOnMap(map, pinPositions);
  }, [map, jobs, pinPositions, previewId, recenterRequest]);

  return null;
}

function JobMarkers({
  jobs,
  pinPositions,
  previewId,
  onPinClick,
}: {
  jobs: Job[];
  pinPositions: Map<string, { lat: number; lng: number }>;
  previewId: string | null;
  onPinClick: (id: string) => void;
}) {
  const pins = useMemo(
    () =>
      jobs
        .map((job) => {
          const coords = pinPositions.get(job.id);
          return coords ? { job, coords } : null;
        })
        .filter((p): p is { job: Job; coords: { lat: number; lng: number } } => p !== null),
    [jobs, pinPositions],
  );

  return (
    <>
      {pins.map(({ job, coords }) => {
        const selected = previewId === job.id;
        return (
          <Marker
            key={job.id}
            position={coords}
            icon={kerjainMapPinIcon(selected)}
            zIndex={selected ? 2 : 1}
            onClick={() => onPinClick(job.id)}
            title={job.title}
          />
        );
      })}
    </>
  );
}

function MapPreviewLayer({
  jobs,
  pinPositions,
  previewId,
  onPreviewClose,
  onViewTask,
}: {
  jobs: Job[];
  pinPositions: Map<string, { lat: number; lng: number }>;
  previewId: string | null;
  onPreviewClose: () => void;
  onViewTask: (id: string) => void;
}) {
  const previewJob = jobs.find((j) => j.id === previewId) ?? null;
  const coords = previewJob ? pinPositions.get(previewJob.id) ?? null : null;

  if (!previewJob || !coords) return null;

  return (
    <InfoWindow position={coords} pixelOffset={[0, -48]} onCloseClick={onPreviewClose}>
      <JobMapPreviewCard job={previewJob} onViewTask={() => onViewTask(previewJob.id)} />
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

function OsmJobsMapFallback({
  jobs,
  pinPositions,
  previewId,
  onPinClick,
  onPreviewClose,
  onViewTask,
}: {
  jobs: Job[];
  pinPositions: Map<string, { lat: number; lng: number }>;
  previewId: string | null;
  onPinClick: (id: string) => void;
  onPreviewClose: () => void;
  onViewTask: (id: string) => void;
}) {
  const pins = jobs
    .map((job) => {
      const coords = pinPositions.get(job.id);
      return coords ? { job, pos: coordsToMapPosition(coords) } : null;
    })
    .filter((p): p is { job: Job; pos: { left: string; top: string } } => p !== null);
  const previewJob = jobs.find((j) => j.id === previewId) ?? null;

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden bg-[#EEF3FB]">
      <img
        src="https://tile.openstreetmap.org/11/1636/1055.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#F7F9FC]/30 pointer-events-none" />
      {pins.map(({ job, pos }) => {
        const active = previewId === job.id;
        return (
          <button
            key={job.id}
            type="button"
            onClick={() => onPinClick(job.id)}
            className="absolute -translate-x-1/2 -translate-y-full z-10 transition-transform"
            style={{ left: pos.left, top: pos.top }}
            title={job.title}
          >
            <img
              src={active ? KERJAIN_PIN_SELECTED : KERJAIN_PIN}
              alt=""
              className={`drop-shadow-md ${active ? "w-[52px] h-[52px]" : "w-[42px] h-[42px]"}`}
              draggable={false}
            />
          </button>
        );
      })}

      {previewJob && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 pointer-events-none">
          <div className="relative pointer-events-auto">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-[#D8E2F0]" />
            <div className="bg-white rounded-2xl shadow-xl border border-[#D8E2F0] p-4">
              <button
                type="button"
                onClick={onPreviewClose}
                className="absolute top-2 right-2 w-6 h-6 text-[#7890AA] hover:text-[#172E4D] text-[18px] leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
              <JobMapPreviewCard job={previewJob} onViewTask={() => onViewTask(previewJob.id)} />
            </div>
          </div>
        </div>
      )}

      <p className="absolute bottom-2 right-3 text-[10px] text-[#7890AA] bg-white/80 px-2 py-0.5 rounded-full z-10">
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
  const pinPositions = useMemo(() => resolveMapPinPositions(jobs), [jobs]);
  const pinCount = pinPositions.size;

  if (!MAPS_KEY) {
    return (
      <OsmJobsMapFallback
        jobs={jobs}
        pinPositions={pinPositions}
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
          mapId={MAPS_ID}
          defaultCenter={JAKARTA_CENTER}
          defaultZoom={11}
          gestureHandling="greedy"
          fullscreenControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          className="w-full h-full"
        >
          <MapResizer />
          <MapViewController
            jobs={jobs}
            pinPositions={pinPositions}
            previewId={previewId}
            recenterRequest={recenterRequest}
          />
          <JobMarkers
            jobs={jobs}
            pinPositions={pinPositions}
            previewId={previewId}
            onPinClick={onPinClick}
          />
          <MapClickCloser active={!!previewId} onClose={onPreviewClose} />
          <MapPreviewLayer
            jobs={jobs}
            pinPositions={pinPositions}
            previewId={previewId}
            onPreviewClose={onPreviewClose}
            onViewTask={onViewTask}
          />
        </Map>
      </APIProvider>

      <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute right-4 bottom-10 pointer-events-auto">
            <button
              type="button"
              onClick={() => setRecenterRequest((n) => n + 1)}
              className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F7F9FC] border border-[#D8E2F0]"
              title="Pusatkan peta"
            >
              <Crosshair size={15} className="text-[#58708D]" />
            </button>
          </div>

          <div className="absolute top-3 left-3 text-[10px] text-[#58708D] bg-white/90 px-2.5 py-1 rounded-full z-10 pointer-events-none border border-[#D8E2F0]">
            Lokasi perkiraan · privasi dilindungi
          </div>

          <div className="absolute bottom-2 right-3 text-[10px] text-[#7890AA] bg-white/80 px-2 py-0.5 rounded-full">
            Google Maps
          </div>

          {pinCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[13px] text-[#58708D] font-semibold bg-white/90 px-4 py-2 rounded-full shadow">
                Tidak ada pekerjaan dengan lokasi di peta
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

# Ceiling Sky Projector

A black-room Canvas projection of a five-pattern June–September learning group—Cygnus, Lyra, Aquila, Scorpius, and Sagittarius—calculated for Riyadh and designed for manual alignment with a ceiling projector such as the HY320.

## Run

```sh
npm install
npm run dev
```

The app opens in an unfocused sky overview with constellation lines off. Choose a constellation to brighten its curated teaching-shape stars and dim unrelated stars; lines remain available as an optional guide and stay off by default. Use the dusk-to-dawn or 24-hour slider to explore time, **Play** to advance at 12 simulated minutes per real second, and **Restart** to return to the active range's beginning. Playback pauses at the slider’s upper boundary.

The IAU defines constellation names and sky boundaries, not official stick figures. The displayed edges are compact, locally authored learning shapes. The Northern Cross, Summer Triangle, and Sagittarius Teapot are asterisms rather than separate IAU constellations. Star names follow the IAU Working Group on Star Names; ICRS/J2000 coordinates and V magnitudes come from individually identified SIMBAD records, with details in [`src/catalog/ATTRIBUTION.md`](src/catalog/ATTRIBUTION.md). All catalogue data ship in the bundle, so normal use requires no network connection.

Turn on **Calibration overlay**, align its N direction with the room’s north wall, then adjust rotation, scale, normalized X/Y offsets, optional projector mirrors, and horizon size. Settings persist in local storage under `ceilingSky.calibration`; **Reset identity** restores neutral projector calibration. If storage is unavailable, the current calibration continues in memory and a message is shown.

**Enter projection** requests fullscreen and hides the panels. A blocked fullscreen request does not stop projection mode. Press `H` to show or hide controls. Exiting fullscreen restores normal UI.

## Coordinate convention

Catalog coordinates are conventional ICRS/J2000 right ascension and declination with V apparent magnitudes, transcribed from [SIMBAD](https://simbad.cds.unistra.fr/simbad/) object records. They are passed unchanged into Astronomy Engine. Every star follows one pipeline:

```text
ICRS/J2000 RA/declination
→ Astronomy Engine altitude/conventional azimuth (N 0°, E 90°)
→ canonical compass vector (north up, east right)
→ inside-sphere sky view (north up, east left)
→ projector calibration
→ canvas
```

The fixed east-left sky-view conversion only negates the canonical X coordinate. It is separate from the user’s `mirrorX` setting. Calibration then establishes horizon radius, applies optional X/Y mirrors, clockwise rotation, uniform scale, offsets normalized to the shorter viewport dimension, and finally the viewport centre. Catalog and horizontal coordinates are never mutated for display.

## Scientific and optical limits

This app uses a sparse educational catalogue, not a complete sky survey. A constellation's highlighted members are the stars chosen for its teaching silhouette, not every star inside its IAU boundary. Fixed J2000 catalogue positions are supplied to the horizontal-coordinate calculation without a complete proper-motion/precession model. Atmospheric and visibility effects are simplified. The calibration is an affine alignment only: it does not correct lens distortion, projector keystone, uneven ceilings, or room geometry. Final north/room alignment is manual.

## Verify

```sh
npm run test:run
npm run build
```

Manual verification should compare known east/west positions with the calibration labels, confirm the whole field moves together, reload to check persistence, and exercise fullscreen plus `H` control hiding on the target projector.

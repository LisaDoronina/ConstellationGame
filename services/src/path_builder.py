import argparse
import json
from pathlib import Path

import matplotlib
import numpy as np
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt


DATA_DIR = Path(__file__).resolve().parent
BOUNDARIES_PATH = DATA_DIR / "constellation_boundaries.txt"
NAMES_PATH = DATA_DIR.parent / "cpp_core" / "data" / "names.json"

CONSTELLATIONS = [
    "AND", "ANT", "APS", "AQR", "AQL", "ARA", "ARI", "AUR", "BOO", "CAE",
    "CAM", "CAP", "CAR", "CAS", "CEN", "CEP", "CET", "CHA", "CIR", "CMA",
    "CMI", "CNC", "COL", "COM", "CRA", "CRB", "CRT", "CRU", "CRV", "CVN",
    "CYG", "DEL", "DOR", "DRA", "EQU", "ERI", "FOR", "GEM", "GRU", "HER",
    "HOR", "HYA", "HYI", "IND", "LAC", "LEO", "LEP", "LIB", "LMI", "LUP",
    "LYN", "LYR", "MEN", "MIC", "MON", "MUS", "NOR", "OCT", "OPH", "ORI",
    "PAV", "PEG", "PER", "PHE", "PIC", "PSA", "PSC", "PUP", "PYX", "RET",
    "SCL", "SCO", "SCT", "SER", "SEX", "SGE", "SGR", "TAU", "TEL", "TRA",
    "TRI", "TUC", "UMA", "UMI", "VEL", "VIR", "VOL", "VUL",
]


def load_boundaries():
    frame = pd.read_csv(BOUNDARIES_PATH, delimiter="|")
    const = np.array(frame[" const"])
    dec = np.array(frame[" dec "]).astype(float)
    ra = np.array([])

    for i in range(np.size(np.array(frame["h "]))):
        current = np.array(frame["h "])[i].split()
        ra = np.append(
            ra,
            15
            * (
                float(current[0])
                + float(current[1]) / 60.0
                + float(current[2]) / 3600.0
            ),
        )
        const[i] = const[i].replace(" ", "")

    return const, ra, dec


def load_name_mapping():
    with open(NAMES_PATH, "r", encoding="utf-8") as file:
        short_to_full = json.load(file)

    full_to_short = {full.upper(): short.upper() for short, full in short_to_full.items()}
    return full_to_short


def normalize_path(path_items):
    full_to_short = load_name_mapping()
    normalized = []

    for item in path_items:
        upper_item = item.strip().upper()
        normalized.append(full_to_short.get(upper_item, upper_item))

    return normalized


def parse_path_argument(raw_path):
    if isinstance(raw_path, list):
        print(f"[path_builder] path already list: {raw_path}")
        return raw_path

    if raw_path is None:
        print("[path_builder] raw path is None")
        return []

    text = str(raw_path).strip()
    print(f"[path_builder] raw path argument: {text}")
    if not text:
        print("[path_builder] raw path is empty after trim")
        return []

    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            print(f"[path_builder] parsed JSON path: {parsed}")
            return parsed
    except json.JSONDecodeError:
        print("[path_builder] raw path is not valid JSON, trying comma-separated parser")
        pass

    parsed_items = [item.strip() for item in text.split(",") if item.strip()]
    print(f"[path_builder] parsed CSV path: {parsed_items}")
    return parsed_items


def fill_segment_to_edge(axis, sra, sdec, color="#00e600", alpha=0.2, zorder=1):
    sra = np.asarray(sra)
    sdec = np.asarray(sdec)

    if np.isclose(sra[0], 360) and np.isclose(sra[-1], 360):
        poly_ra = np.concatenate([sra, [360]])
        poly_dec = np.concatenate([sdec, [sdec[0]]])
        axis.fill(poly_ra, poly_dec, color=color, alpha=alpha, zorder=zorder)
    elif np.isclose(sra[0], 0) and np.isclose(sra[-1], 0):
        poly_ra = np.concatenate([sra, [0]])
        poly_dec = np.concatenate([sdec, [sdec[0]]])
        axis.fill(poly_ra, poly_dec, color=color, alpha=alpha, zorder=zorder)
    elif np.isclose(sra[0], 360):
        poly_ra = np.concatenate([sra, [360, 360]])
        poly_dec = np.concatenate([sdec, [sdec[-1], sdec[0]]])
        axis.fill(poly_ra, poly_dec, color=color, alpha=alpha, zorder=zorder)
    elif np.isclose(sra[-1], 360):
        poly_ra = np.concatenate([sra, [360, sra[0]]])
        poly_dec = np.concatenate([sdec, [sdec[0], sdec[0]]])
        axis.fill(poly_ra, poly_dec, color=color, alpha=alpha, zorder=zorder)
    elif np.isclose(sra[0], 0):
        poly_ra = np.concatenate([sra, [0, 0]])
        poly_dec = np.concatenate([sdec, [sdec[-1], sdec[0]]])
        axis.fill(poly_ra, poly_dec, color=color, alpha=alpha, zorder=zorder)
    elif np.isclose(sra[-1], 0):
        poly_ra = np.concatenate([sra, [0, sra[0]]])
        poly_dec = np.concatenate([sdec, [sdec[0], sdec[0]]])
        axis.fill(poly_ra, poly_dec, color=color, alpha=alpha, zorder=zorder)
    else:
        axis.fill(sra, sdec, color=color, alpha=alpha, zorder=zorder)


def center_one_half_prefer_right(racur, deccur):
    racur = np.asarray(racur)
    deccur = np.asarray(deccur)

    if len(racur) == 0:
        return np.nan, np.nan

    if np.max(racur) - np.min(racur) <= 180:
        return np.mean(racur), np.mean(deccur)

    right_mask = racur < 180
    left_mask = racur >= 180

    n_right = np.sum(right_mask)
    n_left = np.sum(left_mask)

    if n_right >= n_left and n_right > 0:
        return np.mean(racur[right_mask]), np.mean(deccur[right_mask])
    if n_left > 0:
        return np.mean(racur[left_mask]), np.mean(deccur[left_mask])
    return np.mean(racur), np.mean(deccur)


def plot_wrapped_line(axis, x, y, **kwargs):
    x = np.asarray(x)
    y = np.asarray(y)

    if len(x) < 2:
        return

    seg_x = [x[0]]
    seg_y = [y[0]]

    for i in range(1, len(x)):
        x1, x2 = x[i - 1], x[i]
        y1, y2 = y[i - 1], y[i]

        if abs(x2 - x1) > 180:
            if x1 > x2:
                t = (360 - x1) / ((x2 + 360) - x1)
                y_cross = y1 + t * (y2 - y1)
                seg_x.append(360)
                seg_y.append(y_cross)
                axis.plot(seg_x, seg_y, solid_joinstyle="round", solid_capstyle="round", **kwargs)
                seg_x = [0, x2]
                seg_y = [y_cross, y2]
            else:
                t = (0 - x1) / ((x2 - 360) - x1)
                y_cross = y1 + t * (y2 - y1)
                seg_x.append(0)
                seg_y.append(y_cross)
                axis.plot(seg_x, seg_y, solid_joinstyle="round", solid_capstyle="round", **kwargs)
                seg_x = [360, x2]
                seg_y = [y_cross, y2]
        else:
            seg_x.append(x2)
            seg_y.append(y2)

    axis.plot(seg_x, seg_y, solid_joinstyle="round", solid_capstyle="round", **kwargs)


def build_path_image(path_items, output_path):
    const, ra, dec = load_boundaries()
    fill_names = normalize_path(path_items)
    print(f"[path_builder] normalized path: {fill_names}")
    print(f"[path_builder] output path: {output_path}")

    figure, axis = plt.subplots(figsize=(12, 6), facecolor="#090b17")
    centers_ra = []
    centers_dec = []
    center_names = []

    for constellation in CONSTELLATIONS:
        indices = np.where(const == constellation)[0]
        racur = ra[indices]
        deccur = dec[indices]

        if len(racur) < 2:
            continue

        rac = np.append(racur, racur[0])
        decp = np.append(deccur, deccur[0])

        seg_ra = [rac[0]]
        seg_dec = [decp[0]]
        segments = []

        if constellation in fill_names and len(racur) > 0:
            if constellation == "SCL":
                cra, cdec = 10.4, -32.12
            else:
                cra, cdec = center_one_half_prefer_right(racur, deccur)

            centers_ra.append(cra)
            centers_dec.append(cdec)
            center_names.append(constellation)

        for i in range(1, len(rac)):
            ra1, ra2 = rac[i - 1], rac[i]
            dec1, dec2 = decp[i - 1], decp[i]

            if abs(ra2 - ra1) > 180:
                if ra1 > ra2:
                    t = (360 - ra1) / ((ra2 + 360) - ra1)
                    dec_cross = dec1 + t * (dec2 - dec1)
                    seg_ra.append(360)
                    seg_dec.append(dec_cross)
                    segments.append((np.array(seg_ra), np.array(seg_dec)))
                    seg_ra = [0, ra2]
                    seg_dec = [dec_cross, dec2]
                else:
                    t = (0 - ra1) / ((ra2 - 360) - ra1)
                    dec_cross = dec1 + t * (dec2 - dec1)
                    seg_ra.append(0)
                    seg_dec.append(dec_cross)
                    segments.append((np.array(seg_ra), np.array(seg_dec)))
                    seg_ra = [360, ra2]
                    seg_dec = [dec_cross, dec2]
            else:
                seg_ra.append(ra2)
                seg_dec.append(dec2)

        segments.append((np.array(seg_ra), np.array(seg_dec)))
        for sra, sdec in segments:
            axis.plot(sra, sdec, lw=0.7, color="white", alpha=0.75)
            if constellation in fill_names:
                fill_segment_to_edge(axis, sra, sdec, color="#29d17d", alpha=0.18, zorder=0)

    if centers_ra and centers_dec:
        order = [center_names.index(name) for name in fill_names if name in center_names]
        order = np.array(order)
        ordered_ra = np.array(centers_ra)[order]
        ordered_dec = np.array(centers_dec)[order]
        ordered_names = np.array(center_names, dtype=object)[order]

        plot_wrapped_line(
            axis,
            ordered_ra,
            ordered_dec,
            color="#29d17d",
            linewidth=2.5,
            zorder=10,
        )

        axis.scatter(
            [ordered_ra[0]],
            [ordered_dec[0]],
            color="#29d17d",
            s=55,
            zorder=11,
        )

        axis.text(
            ordered_ra[0],
            ordered_dec[0] + 4,
            ordered_names[0],
            color="#29d17d",
            fontsize=10,
            ha="center",
            va="bottom",
            zorder=12,
        )

    axis.set_facecolor("#090b17")
    axis.set_xlim(360, 0)
    axis.set_ylim(-90, 90)
    axis.set_xticks([])
    axis.set_yticks([])
    for spine in axis.spines.values():
        spine.set_visible(False)

    plt.tight_layout()
    figure.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=figure.get_facecolor())
    plt.close(figure)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path-json",
        required=True,
        help="Path items either as JSON array or as comma-separated string like 'CMA, MON, ORI'",
    )
    parser.add_argument("--output", required=True, help="Output PNG path")
    args = parser.parse_args()

    path_items = parse_path_argument(args.path_json)
    print(f"[path_builder] building image for path items: {path_items}")
    build_path_image(path_items, args.output)


if __name__ == "__main__":
    main()

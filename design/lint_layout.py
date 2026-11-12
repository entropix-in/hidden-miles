"""Layout lint for the FigCraft redesign.

Reads an inspect_document JSON dump (fields: name, type, absoluteBounds, characters,
strokes, clip, layout) and reports:
  * text-overlap   two text layers whose boxes intersect
  * text-clipped   text that spills outside a clipping ancestor
  * tight-padding  text closer than MIN_PAD to the edge of a bordered/filled box it sits in

    python3 design/lint_layout.py dump.json
"""
import json
import sys

MIN_PAD = 8


def box(n):
    b = n.get("absoluteBounds") or {}
    return b.get("x", 0), b.get("y", 0), b.get("x", 0) + b.get("width", 0), b.get("y", 0) + b.get("height", 0)


def inter(a, b):
    w = min(a[2], b[2]) - max(a[0], b[0])
    h = min(a[3], b[3]) - max(a[1], b[1])
    return w * h if w > 1 and h > 1 else 0


def walk(n, anc, out):
    out.append((n, anc))
    for c in n.get("children", []) or []:
        walk(c, anc + [n], out)


def main(path):
    d = json.load(open(path))
    issues = []
    for top in d["pages"][0]["children"]:
        nodes = []
        walk(top, [], nodes)
        texts = [(n, a) for n, a in nodes if n.get("type") == "TEXT" and not any(x.get("name") == "Stamp" for x in a)]
        # 1. overlaps
        for i in range(len(texts)):
            ta = box(texts[i][0])
            for j in range(i + 1, len(texts)):
                tb = box(texts[j][0])
                if inter(ta, tb) > 6:
                    issues.append((top["name"], "text-overlap", texts[i][0].get("characters", "")[:30], texts[j][0].get("characters", "")[:30]))
        for n, anc in texts:
            t = box(n)
            # 2. clipped by an ancestor
            for a in anc:
                if a.get("clip") and a is not top:
                    b = box(a)
                    if t[0] < b[0] - 1 or t[2] > b[2] + 1 or t[1] < b[1] - 1 or t[3] > b[3] + 1:
                        issues.append((top["name"], "text-clipped", n.get("characters", "")[:40], a.get("name")))
                        break
            # 3. tight padding inside the nearest bordered box
            for a in reversed(anc):
                if a.get("strokes"):
                    b = box(a)
                    gap = min(t[0] - b[0], b[2] - t[2], t[1] - b[1], b[3] - t[3])
                    if gap < MIN_PAD:
                        issues.append((top["name"], "tight-padding", n.get("characters", "")[:40], f"{a.get('name')} gap={gap:.0f}"))
                    break
    seen = set()
    for it in issues:
        if it in seen:
            continue
        seen.add(it)
        print(" | ".join(str(x) for x in it))
    print(f"\n{len(seen)} issues")


if __name__ == "__main__":
    main(sys.argv[1])

"""Hidden Miles — "Field Journal" redesign generator for FigCraft.

Builds every customer-facing page plus a design-system sheet as FigCraft command
scripts, then runs them with `figcraft-cli run`.

    python3 design/generate_pages.py <image-dir> <out.figcraft>

Design language
  * Ink (navy 950) on paper (sand 50); gold is the only accent; blue is used for links and info.
  * Fraunces for display (with a gold italic second line), Manrope for UI and body text.
  * One type scale, one 8px spacing grid, a 1200px content column (120px side margins at 1440).
  * Signature motifs: dashed route lines, coordinate labels, numbered sections (No. 01),
    a circular "since 1984" stamp and faint contour-map lines on the navy sections.
"""
import itertools
import json
import math
import os
import subprocess
import sys

IMG_DIR = sys.argv[1] if len(sys.argv) > 1 else "img"
OUT = sys.argv[2] if len(sys.argv) > 2 else "hidden-miles-redesign.figcraft"

# ------------------------------------------------------------------ tokens
INK, INK2, INK3 = "#0B2735", "#265A6D", "#36879F"      # navy 950 / 700 / 500
MUTED = "#5AA5BB"                                      # navy 400 — meta text on paper only at >=14px
PAPER, PAPER2, PAPER3, LINE = "#FFFFFF", "#FAF8F3", "#F3EEE2", "#EAE2CF"
GOLD, GOLD_D, GOLD_L = "#DDB02A", "#A87612", "#F9F0C9"  # gold 400 / 600 (text on paper) / 100
BLUE, BLUE_D, BLUE_L = "#2698BD", "#196785", "#EEF9FD"
WHITE, ON_INK, ON_INK2 = "#FFFFFF", "#FDFBF5", "#BEDEE8"
SUCCESS, DANGER = "#1C7A55", "#B4483D"

# type scale: role -> (family, style, size, line height, tracking)
TYPE = {
    "display": ("Fraunces", "Regular", 84, 88, -2.4),
    "h1": ("Fraunces", "Regular", 64, 70, -1.6),
    "h2": ("Fraunces", "Regular", 48, 56, -1.0),
    "h3": ("Fraunces", "Regular", 32, 40, -0.5),
    "h4": ("Fraunces", "Medium", 24, 32, -0.2),
    "title": ("Manrope", "Bold", 18, 26, 0),
    "lead": ("Manrope", "Regular", 19, 32, 0),
    "body": ("Manrope", "Regular", 16, 27, 0),
    "body-b": ("Manrope", "SemiBold", 16, 24, 0),
    "small": ("Manrope", "Medium", 14, 22, 0),
    "small-b": ("Manrope", "Bold", 14, 20, 0),
    "label": ("Manrope", "ExtraBold", 12, 16, 2.0),   # uppercase only
    "button": ("Manrope", "Bold", 15, 20, 0.1),
    "price": ("Manrope", "ExtraBold", 22, 28, -0.2),
}
W, SIDE = 1440, 120            # frame width, side margin -> 1200 content column
SEC, SEC_S = 128, 96           # section vertical padding (major / minor)
R_LG, R_MD, R_SM = 28, 20, 12

IMGS = dict(kashmir="d8", kerala="d7", rajasthan="d1", japan="d3", bali="d6", maldives="d9", thailand="d10",
            ladakh="d11", couple="d12", europe="d13", group="d14", beach="d4", dubai="d5", aurora="d2",
            hero="hero", paris="cta")

# ------------------------------------------------------------------ primitives
_ids = itertools.count()
cmds: list = []


def ref(n):
    return {"$ref": n}


def node(kind, parent, name=None, props=None, **kw):
    a = f"n{next(_ids)}"
    p = {"type": kind, "parent": parent, "props": props or {}}
    if name:
        p["name"] = name
    p.update(kw)
    cmds.append({"command": "node.create", "as": a, "params": p})
    return ref(a)


def setp(target, **props):
    cmds.append({"command": "node.set", "params": {"ids": [target], **props}})


def frame(parent, name="Frame", d="v", gap=0, pad=0, fill=None, w=None, h=None, sh="hug", sv="hug", **props):
    if d is None:
        pr = {}
    else:
        pr = {"layout": "vertical" if d == "v" else "horizontal", "gap": gap, "padding": pad, "sizingH": sh, "sizingV": sv}
    if d is None and sh == "fill":
        pr["sizingH"] = "fill"
    pr["fills"] = [fill] if isinstance(fill, str) else (fill or [])
    kw = {}
    for k in ("x", "y"):
        if k in props:
            kw[k] = props.pop(k)
    pr.update(props)
    sides = ("strokeTopWeight", "strokeRightWeight", "strokeBottomWeight", "strokeLeftWeight")
    if any(k in pr for k in sides):          # one-sided border: zero the other sides explicitly
        for k in sides:
            pr.setdefault(k, 0)
        if not pr.get("stroke"):
            for k in sides:
                pr.pop(k)
    if w is not None:
        kw["width"] = w
    if h is not None:
        kw["height"] = h
    return node("frame", parent, name, pr, **kw)


def H(parent, name="Row", **k):
    return frame(parent, name, "h", **k)


def V(parent, name="Stack", **k):
    return frame(parent, name, "v", **k)


def T(parent, s, role="body", fill=INK, w=None, **props):
    fam, style, size, lh, tr = TYPE[role]
    if role == "label":
        s = s.upper()
    pr = {"fontFamily": fam, "fontStyle": style, "fontSize": size, "lineHeight": lh, "letterSpacing": tr, "fill": fill}
    pr.update(props)
    kw = {"text": s}
    if w:
        kw["width"] = w
    return node("text", parent, s[:40].replace("\n", " "), pr, **kw)


def image(target, key):
    cmds.append({"command": "image.place", "params": {"path": os.path.join(IMG_DIR, IMGS.get(key, key) + ".jpg"), "target": target, "mode": "fill"}})


def rect(parent, w, h, fill, name="Rect", **p):
    pr = {"fill": fill} if isinstance(fill, str) else {"fills": fill}
    kw = {k: p.pop(k) for k in ("x", "y") if k in p}
    pr.update(p)
    return node("rectangle", parent, name, pr, width=w, height=h, **kw)


def grad(stops, frm=(0.5, 0), to=(0.5, 1)):
    return [{"type": "linearGradient", "stops": [{"position": p, "color": c} for p, c in stops], "from": list(frm), "to": list(to)}]


def dashed(parent, color=LINE, vertical=False, length=100, name="Route line", fill=True):
    """The dashed 'route' rule used as a divider all over the site."""
    p = {"stroke": color, "strokeWeight": 1.5, "dashes": [6, 6]}
    if vertical:
        return node("line", parent, name, dict(p, rotation=90), width=length)
    if fill:
        p["sizingH"] = "fill"
    return node("line", parent, name, p, width=length)


def photo(parent, key, w, h, r=R_MD, name="Photo", sh=None, **p):
    f = frame(parent, name, None, fill=INK, w=w, h=h, cornerRadius=r, clip=True, **p)
    if sh:
        setp(f, sizingH=sh)
    image(f, key)
    return f


def shadow(y=24, blur=48, a="14"):
    return [{"type": "dropShadow", "color": INK + a, "offset": [0, y], "radius": blur}]


# ------------------------------------------------------------------ components
def headline(parent, line1, accent=None, role="h2", dark=False, align="left", w=None):
    """Display headline: ink line(s) + optional gold italic accent line."""
    box = V(parent, "Headline", gap=0, crossAlign={"left": "min", "center": "center"}[align])
    fam, style, size, lh, tr = TYPE[role]
    T(box, line1, role, ON_INK if dark else INK, w=w, textAlign=align)
    if accent:
        T(box, accent, role, GOLD if dark else GOLD_D, w=w, textAlign=align, fontStyle="Italic")
    return box


def kicker(parent, num, label, dark=False):
    """Section kicker: italic gold number, a short rule and an uppercase label."""
    k = H(parent, "Kicker", gap=12, crossAlign="center")
    if num:
        T(k, f"No. {num}", "small", GOLD if dark else GOLD_D, fontFamily="Fraunces", fontStyle="Italic", fontSize=16)
        rect(k, 32, 1.5, GOLD if dark else GOLD_D, "Rule")
    T(k, label, "label", "#78CFEB" if dark else BLUE_D)
    return k


def section(pg, name, fill=None, pad=(SEC, SIDE, SEC, SIDE), gap=56, **p):
    return V(pg, name, gap=gap, pad=list(pad), fill=fill, sh="fill", **p)


def section_head(parent, num, label, line1, accent=None, sub=None, right=None, dark=False, align="left"):
    h = H(parent, "Section header", mainAlign="spaceBetween", crossAlign="max", sh="fill", gap=48)
    t = V(h, "Title", gap=20, sh="fill" if align == "center" else "hug", crossAlign="center" if align == "center" else "min")
    kicker(t, num, label, dark)
    headline(t, line1, accent, "h2", dark, align)
    if sub:
        T(t, sub, "lead", ON_INK2 if dark else INK2, w=640, textAlign=align)
    if right:
        right(h)
    return h


BTN = {"primary": (GOLD, INK, None), "ink": (INK, PAPER, None), "blue": (BLUE, WHITE, None),
       "outline": (None, INK, INK), "ghost-light": ("#FFFFFF14", PAPER, "#FFFFFF4D"), "light": (WHITE, INK, LINE),
       "whatsapp": ("#1C9A6C", WHITE, None)}


def button(parent, label, kind="primary", size="md", arrow=False, fill_w=False, icon=None):
    bg, fg, st = BTN[kind]
    pad = {"sm": [10, 18, 10, 18], "md": [14, 24, 14, 24], "lg": [18, 30, 18, 30]}[size]
    if arrow:
        pad = [pad[0] - 6, pad[1] - 6, pad[2] - 6, pad[3]]
    extra = {"stroke": st, "strokeWeight": 1.5} if st else {}
    b = H(parent, f"Button/{kind}/{size}", gap=12, pad=pad, fill=bg, cornerRadius=999, mainAlign="center", crossAlign="center",
          sh="fill" if fill_w else "hug", **extra)
    if icon:
        T(b, icon, "button", fg)
    T(b, label, "button", fg, fontSize=14 if size == "sm" else 15)
    if arrow:
        dot = H(b, "Arrow", fill=INK if kind == "primary" else (GOLD if kind == "ink" else (fg + "1F")), cornerRadius=999,
                w=32 if size != "sm" else 26, h=32 if size != "sm" else 26, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
        T(dot, "→", "small-b", GOLD if kind == "primary" else (INK if kind == "ink" else fg))
    return b


def chip(parent, label, active=False, dark=False, count=None):
    if dark:
        c = H(parent, "Chip", gap=8, pad=[8, 14, 8, 14], cornerRadius=999, fill="#FFFFFF1A", crossAlign="center")
        T(c, label, "small-b", ON_INK, fontSize=13)
        return c
    c = H(parent, "Chip", gap=8, pad=[10, 18, 10, 18], cornerRadius=999, fill=INK if active else WHITE,
          stroke=None if active else LINE, strokeWeight=1, crossAlign="center")
    T(c, label, "small-b", PAPER if active else INK2)
    if count is not None:
        T(c, str(count), "small", GOLD if active else MUTED, fontSize=13)
    return c


def badge(parent, label, kind="gold", **p):
    bg, fg = {"gold": (GOLD, INK), "paper": (PAPER, INK), "ink": (INK, PAPER), "blue": (BLUE_L, BLUE_D),
              "success": ("#E5F4EC", SUCCESS), "glass": ("#0B273599", PAPER), "danger": ("#FBEAE7", DANGER)}[kind]
    b = H(parent, "Badge", pad=[6, 12, 6, 12], cornerRadius=999, fill=bg, **p)
    T(b, label, "label", fg, fontSize=11, letterSpacing=1.2)
    return b


def icon(parent, glyph, bg=PAPER3, fg=INK, size=48, r=None, **p):
    b = H(parent, "Icon", fill=bg, cornerRadius=size / 2 if r is None else r, w=size, h=size, sh="fixed", sv="fixed",
          mainAlign="center", crossAlign="center", **p)
    T(b, glyph, "small-b", fg, fontSize=round(size * 0.4), lineHeight=round(size * 0.5))
    return b


def stamp(parent, x, y, size=148, bg=GOLD, fg=INK, txt="HIDDEN MILES · SINCE 1984 · WANDER WELL · "):
    s = frame(parent, "Stamp", None, fill=bg, w=size, h=size, cornerRadius=size / 2, x=x, y=y,
              effects=shadow(12, 32, "26"))
    inset = 20 * size / 148
    c = node("ellipse", s, "Path", {"fills": []}, x=inset, y=inset, width=size - 2 * inset, height=size - 2 * inset)
    t = T(s, txt, "label", fg, fontSize=round(11 * size / 148), letterSpacing=2.2)
    cmds.append({"command": "text.onPath", "params": {"text": t, "path": c}})
    centre = H(s, "Centre", w=size * 0.42, h=size * 0.42, sh="fixed", sv="fixed", cornerRadius=999, fill=INK if bg == GOLD else GOLD,
               mainAlign="center", crossAlign="center", x=size * 0.29, y=size * 0.29)
    T(centre, "H", "h4", GOLD if bg == GOLD else INK, fontSize=round(size * 0.2), lineHeight=round(size * 0.24))
    return s


def contours(parent, w, h, color="#FFFFFF", alpha="0F", n=9, cx=0.78, cy=0.35, seed=1.0):
    """Faint topographic contour lines — the map motif behind dark sections."""
    g = frame(parent, "Contours", None, w=w, h=h, clip=True)
    for i in range(n):
        r = 60 + i * 52
        pts = []
        for k in range(73):
            a = k / 72 * 2 * math.pi
            rr = r * (1 + 0.12 * math.sin(3 * a + seed + i * 0.4) + 0.06 * math.cos(5 * a - i * 0.7))
            pts.append((w * cx + rr * math.cos(a) * 1.35, h * cy + rr * math.sin(a)))
        d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"
        node("vector", g, "Contour", {"fills": [], "stroke": color + alpha, "strokeWeight": 1.2}, path=d)
    return g


def coord(parent, s, dark=True, **p):
    return T(parent, s, "label", ON_INK if dark else INK3, fontSize=11, letterSpacing=1.6, **p)


def rating(parent, score="4.9", count="210", dark=False):
    r = H(parent, "Rating", gap=6, crossAlign="center")
    T(r, "★", "small-b", GOLD)
    T(r, score, "small-b", ON_INK if dark else INK)
    T(r, f"({count})", "small", ON_INK2 if dark else MUTED)
    return r


def field(parent, label, value, placeholder=False, tall=False, w=None, sh="fill", suffix=None, hint=None):
    f = V(parent, "Field", gap=8, sh=sh, w=w)
    T(f, label, "small-b", INK)
    box = H(f, "Input", pad=[15, 18, 15, 18], fill=WHITE, cornerRadius=14, stroke=LINE, strokeWeight=1.5, sh="fill",
            mainAlign="spaceBetween", h=128 if tall else None, sv="fixed" if tall else "hug", crossAlign="min" if tall else "center")
    T(box, value, "body", MUTED if placeholder else INK)
    if suffix:
        T(box, suffix, "small-b", INK3)
    if hint:
        T(f, hint, "small", MUTED, fontSize=13)
    return f


# ------------------------------------------------------------------ chrome
NAV = [("Home", False), ("Group Tours", True), ("Destinations", True), ("Speciality Tours", True), ("Personalised", False), ("About", False)]


def utility_bar(pg):
    u = H(pg, "Utility bar", pad=[10, SIDE, 10, SIDE], mainAlign="spaceBetween", crossAlign="center", fill=INK, sh="fill")
    l = H(u, "Left", gap=24, crossAlign="center")
    rating(l, "4.9", "12,400+ verified reviews", dark=True)
    T(l, "·", "small", ON_INK2)
    T(l, "Hosting travellers since 1984", "small", ON_INK2, fontSize=13)
    r = H(u, "Right", gap=28, crossAlign="center")
    for s in ("Mon–Sat · 9:30 am – 7:00 pm", "☎  +91 98204 12345", "✉  hello@hiddenmiles.in", "WhatsApp us  ↗"):
        T(r, s, "small", GOLD if "WhatsApp" in s else ON_INK, fontSize=13, fontStyle="SemiBold" if "WhatsApp" in s else "Medium")


def logo(parent, dark=False, size=1.0):
    lg = H(parent, "Logo", gap=12, crossAlign="center")
    m = H(lg, "Mark", fill=GOLD if dark else INK, cornerRadius=12 * size, w=42 * size, h=42 * size, sh="fixed", sv="fixed",
          mainAlign="center", crossAlign="center")
    T(m, "H", "h4", INK if dark else GOLD, fontSize=round(22 * size), lineHeight=round(26 * size), fontStyle="SemiBold")
    t = V(lg, "Wordmark", gap=0)
    T(t, "Hidden Miles", "h4", ON_INK if dark else INK, fontSize=round(22 * size), lineHeight=round(26 * size), fontStyle="SemiBold")
    T(t, "EST. 1984 · MUMBAI", "label", GOLD if dark else GOLD_D, fontSize=9, letterSpacing=2.2, lineHeight=12)
    return lg


def nav(pg, active, open_menu=False):
    utility_bar(pg)
    n = H(pg, "Main nav", pad=[18, SIDE, 18, SIDE], mainAlign="spaceBetween", crossAlign="center", fill=PAPER, sh="fill",
          stroke=LINE, strokeBottomWeight=1)
    logo(n)
    links = H(n, "Links", gap=6, crossAlign="center")
    for item, has_menu in NAV:
        on = item == active
        l = V(links, "Nav item", gap=4, pad=[10, 14, 6, 14], crossAlign="center",
              fill=PAPER3 if (open_menu and item == "Destinations") else None, cornerRadius=12)
        row = H(l, "Label", gap=6, crossAlign="center")
        T(row, item, "small-b", INK if on else INK2, fontSize=15, fontStyle="Bold" if on else "SemiBold")
        if has_menu:
            T(row, "⌄", "small-b", INK3, fontSize=13)
        node("ellipse", l, "Active dot", {"fill": GOLD if on else "#00000000"}, width=6, height=6)
    a = H(n, "Actions", gap=10, crossAlign="center")
    s = H(a, "Search", gap=10, pad=[11, 16, 11, 14], cornerRadius=999, fill=WHITE, stroke=LINE, strokeWeight=1.5, crossAlign="center")
    T(s, "⌕", "small-b", INK, fontSize=16)
    T(s, "Search", "small", MUTED)
    T(s, "⌘K", "label", INK3, fontSize=10, letterSpacing=0.5)
    sv = frame(a, "Saved", None, w=46, h=46)
    icon(sv, "♡", WHITE, INK, 46, stroke=LINE, strokeWeight=1.5)
    cnt = H(sv, "Count", fill=GOLD, cornerRadius=999, w=18, h=18, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", x=30, y=-2)
    T(cnt, "3", "label", INK, fontSize=10, letterSpacing=0)
    button(a, "Plan my trip", "ink", "md", arrow=True)
    return n


def mega_menu(parent, x, y):
    """Destinations mega menu (open state of the nav)."""
    m = H(parent, "Mega menu — Destinations", gap=48, pad=40, fill=WHITE, cornerRadius=R_LG, w=1200, sh="fixed",
          stroke=LINE, strokeWeight=1, effects=shadow(32, 64, "1F"), x=x, y=y)
    for title, items in [("India", [("Kashmir", 12), ("Kerala", 9), ("Rajasthan", 11), ("Ladakh", 7), ("Himachal", 8), ("North East", 5), ("Andaman", 4)]),
                         ("International", [("Europe", 8), ("Japan", 4), ("Bali", 6), ("Dubai", 5), ("Maldives", 3), ("Thailand", 6), ("Sri Lanka", 3)])]:
        c = V(m, title, gap=6, w=250, sh="fixed")
        T(c, title, "label", GOLD_D)
        rect(c, 10, 8, "#00000000", "Space")
        for i, (nm, k) in enumerate(items):
            r = H(c, "Menu item", pad=[10, 12, 10, 12], cornerRadius=12, mainAlign="spaceBetween", crossAlign="center", sh="fill",
                  fill=PAPER2 if (title == "India" and i == 0) else None)
            T(r, nm, "body-b", INK)
            T(r, f"{k} tours", "small", MUTED, fontSize=13)
        T(c, f"All {title.lower()} destinations  →", "small-b", BLUE_D)
    f = frame(m, "Featured", None, w=508, h=420, cornerRadius=R_MD, clip=True, fill=INK)
    image(f, "kashmir")
    rect(f, 508, 420, grad([(0.35, INK + "00"), (1, INK + "F2")]), "Scrim")
    b = V(f, "Copy", gap=12, w=444, sh="fixed", x=32, y=236)
    badge(b, "Season pick · Apr – Oct")
    T(b, "Kashmir in bloom", "h3", ON_INK)
    T(b, "Tulip gardens, houseboats and meadows — 12 departures this season.", "small", ON_INK2, sizingH="fill")
    T(b, "Explore Kashmir  →", "small-b", GOLD)
    return m


def footer(pg):
    f = V(pg, "Footer", gap=72, pad=[SEC_S, SIDE, 48, SIDE], fill=INK, sh="fill", clip=True)
    top = H(f, "Sign-off", mainAlign="spaceBetween", crossAlign="max", sh="fill")
    hl = V(top, "Headline", gap=0)
    T(hl, "Wander well,", "display", ON_INK, fontSize=88, lineHeight=92)
    T(hl, "we'll handle the rest.", "display", GOLD, fontSize=88, lineHeight=92, fontStyle="Italic")
    nl = V(top, "Newsletter", gap=16, w=440, sh="fixed")
    T(nl, "Postcards, once a month", "title", ON_INK)
    T(nl, "New departures, early-bird fares and one good travel story. No spam, ever.", "small", ON_INK2, sizingH="fill")
    row = H(nl, "Form", pad=6, crossAlign="center", cornerRadius=999, fill="#FFFFFF12", stroke="#FFFFFF26", strokeWeight=1, sh="fill")
    i = H(row, "Input", pad=[0, 16, 0, 16], sh="fill")
    T(i, "you@email.com", "small", "#8FC6D6")
    button(row, "Subscribe", "primary", "sm")
    dashed(f, "#FFFFFF33", length=1200)
    cols = H(f, "Columns", gap=48, sh="fill")
    b = V(cols, "Brand", gap=20, w=320, sh="fixed")
    logo(b, dark=True)
    T(b, "Offbeat journeys, thoughtfully planned. Group tours, family holidays and bespoke escapes across India and the world.", "small", ON_INK2, sizingH="fill")
    soc = H(b, "Social", gap=10)
    for g in ("IG", "FB", "YT", "IN"):
        icon(soc, g, "#FFFFFF14", ON_INK, 40)
    for h, items in [("Travel", ["Group tours", "Destinations", "Speciality tours", "Personalised holidays", "Corporate travel"]),
                     ("Company", ["About us", "Guest stories", "Experiences", "Careers", "Contact"]),
                     ("Help", ["Booking & payments", "Cancellations", "Visa assistance", "Travel insurance", "FAQs"]),
                     ("Visit us", ["302, Meridian House", "Andheri East, Mumbai", "Mon–Sat, 9:30–7:00", "+91 98204 12345"])]:
        c = V(cols, h, gap=14, sh="fill")
        T(c, h, "label", GOLD)
        rect(c, 10, 4, "#00000000", "Space")
        for it in items:
            T(c, it, "small", "#DBEDF3", sizingH="fill")
    bt = H(f, "Legal", mainAlign="spaceBetween", sh="fill", crossAlign="center")
    T(bt, "© 2026 Hidden Miles Holidays Pvt. Ltd.  ·  IATA accredited  ·  GSTIN 27AAACH1234F1Z5", "small", "#8FC6D6", fontSize=13)
    T(bt, "Privacy   ·   Terms   ·   Cookie settings", "small", "#DBEDF3", fontSize=13)


def page(name, x, y=0, width=W):
    return frame(1, name, "v", fill=PAPER, w=width, sh="fixed", clip=True, x=x, y=y)


def crumbs(parent, items, dark=False):
    bc = H(parent, "Breadcrumbs", gap=10, crossAlign="center")
    for i, c in enumerate(items):
        if i:
            T(bc, "/", "small", "#FFFFFF66" if dark else LINE)
        last = i == len(items) - 1
        T(bc, c, "small-b" if last else "small", (ON_INK if last else ON_INK2) if dark else (INK if last else INK3), fontSize=13)
    return bc


def page_hero(pg, path, line1, accent, sub, img, extra=None, coords=None):
    """Editorial split hero for inner pages: copy on paper, photo on the right."""
    h = H(pg, "Page hero", gap=72, pad=[56, SIDE, SEC_S, SIDE], sh="fill", crossAlign="center")
    c = V(h, "Copy", gap=28, sh="fill")
    crumbs(c, path)
    headline(c, line1, accent, "h1")
    T(c, sub, "lead", INK2, w=520)
    if extra:
        extra(c)
    ph = frame(h, "Visual", None, w=560, h=440)
    photo(ph, img, 560, 440, R_LG)
    rect(ph, 560, 440, grad([(0.6, INK + "00"), (1, INK + "99")]), "Scrim", cornerRadius=R_LG)
    if coords:
        coord(ph, coords, x=28, y=400)
    return h


# ------------------------------------------------------------------ cards
TOURS = [
    ("kashmir", "Magical Kashmir", "Srinagar · Gulmarg · Pahalgam", "8D / 7N", "₹58,900", "₹64,500", "Bestseller", "4.9", "210", "12 Dec · 6 seats left", "34.08° N  74.79° E"),
    ("kerala", "Kerala Backwaters", "Kochi · Munnar · Alleppey", "6D / 5N", "₹42,500", None, "New", "4.8", "154", "18 Dec · 14 seats", "9.49° N  76.33° E"),
    ("japan", "Wonders of Japan", "Tokyo · Hakone · Kyoto · Osaka", "10D / 9N", "₹1,94,000", "₹2,15,000", "Filling fast", "4.9", "98", "28 Mar · 3 seats left", "35.01° N  135.77° E"),
    ("ladakh", "Ladakh Road Trip", "Leh · Nubra · Pangong", "7D / 6N", "₹49,900", None, None, "4.8", "176", "6 Jun · 18 seats", "34.15° N  77.58° E"),
    ("rajasthan", "Royal Rajasthan", "Jaipur · Jodhpur · Udaipur", "9D / 8N", "₹54,000", "₹59,000", "Bestseller", "4.7", "232", "20 Jan · 9 seats", "26.91° N  75.79° E"),
    ("bali", "Bali Bliss", "Ubud · Nusa Penida · Seminyak", "7D / 6N", "₹89,500", None, None, "4.8", "121", "14 Feb · 11 seats", "8.51° S  115.26° E"),
    ("europe", "Grand Europe", "Paris · Swiss Alps · Venice · Rome", "14D / 13N", "₹2,89,000", None, "Early bird", "4.9", "87", "2 May · 20 seats", "46.82° N  8.23° E"),
    ("maldives", "Maldives Overwater", "Malé · Maafushi", "5D / 4N", "₹1,12,000", None, None, "4.9", "64", "Daily departures", "3.20° N  73.22° E"),
    ("thailand", "Thailand Islands", "Bangkok · Phuket · Krabi", "8D / 7N", "₹72,900", "₹78,000", None, "4.7", "143", "8 Jan · 16 seats", "8.09° N  98.90° E"),
]


def tour_card(parent, t, w=None, img_h=240, est_w=376):
    img, title, route, dur, price, old, tag, score, cnt, next_dep, crd = t
    c = V(parent, "Tour card", gap=0, pad=8, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1,
          sh="fill" if w is None else "fixed", w=w, effects=shadow(12, 32, "0A"))
    m = frame(c, "Media", None, fill=INK, w=(w or est_w) - 16, h=img_h, cornerRadius=R_MD, clip=True, sh="fill")
    image(m, img)
    rect(m, (w or est_w) - 16, img_h, grad([(0.55, INK + "00"), (1, INK + "B3")]), "Scrim")
    if tag:
        badge(m, tag, "danger" if tag == "Filling fast" else "gold", x=16, y=16)
    sv = H(m, "Save", fill="#FFFFFFEB", cornerRadius=999, w=40, h=40, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", x=(w or est_w) - 16 - 56, y=16)
    T(sv, "♡", "small-b", INK, fontSize=17)
    coord(m, crd, x=16, y=img_h - 30)
    b = V(c, "Body", gap=16, pad=[20, 16, 16, 16], sh="fill")
    meta = H(b, "Meta", gap=14, crossAlign="center")
    T(meta, dur, "small-b", INK3, fontSize=13)
    T(meta, "·", "small", LINE)
    rating(meta, score, cnt)
    tx = V(b, "Text", gap=6, sh="fill")
    T(tx, title, "h4")
    T(tx, route, "small", INK3)
    dep = H(b, "Next departure", gap=8, crossAlign="center", pad=[8, 12, 8, 12], cornerRadius=10, fill=PAPER2)
    node("ellipse", dep, "Dot", {"fill": DANGER if "left" in next_dep else SUCCESS}, width=8, height=8)
    T(dep, "Next: " + next_dep, "small", INK2, fontSize=13)
    dashed(b, LINE, length=300)
    ft = H(b, "Footer", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    p = V(ft, "Price", gap=2)
    if old:
        T(p, f"From  ·  was {old}", "small", MUTED, fontSize=13)
    else:
        T(p, "From", "small", MUTED, fontSize=13)
    pr = H(p, "Amount", gap=4, crossAlign="max")
    T(pr, price, "price")
    T(pr, "/ person", "small", MUTED, fontSize=13)
    button(ft, "View", "ink", "sm", arrow=True)
    return c


def dest_card(parent, key, name, sub, count, crd, w, h, big=False):
    c = frame(parent, "Destination/" + name, None, fill=INK, w=w, h=h, cornerRadius=R_LG, clip=True)
    image(c, key)
    rect(c, w, h, grad([(0.0, INK + "40"), (0.3, INK + "00"), (0.55, INK + "00"), (1, INK + "F2")]), "Scrim")
    top = H(c, "Top", mainAlign="spaceBetween", crossAlign="center", w=w - 48, sh="fixed", x=24, y=24)
    cp = H(top, "Coordinates", pad=[6, 12, 6, 12], cornerRadius=999, fill="#0B273573")
    coord(cp, crd)
    badge(top, count, "glass")
    l = V(c, "Label", gap=8, w=w - 140, sh="fixed", x=28, y=h - (150 if big else 124))
    T(l, name, "h2" if big else "h3", ON_INK)
    T(l, sub, "small", ON_INK2, sizingH="fill")
    a = H(c, "Go", fill=GOLD, cornerRadius=999, w=52, h=52, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", x=w - 80, y=h - 80)
    T(a, "↗", "title", INK)
    return c


def row_grid(parent, items, cols, fn, gap=32, rgap=None):
    g = V(parent, "Grid", gap=rgap or gap, sh="fill")
    for i in range(0, len(items), cols):
        r = H(g, "Row", gap=gap, sh="fill")
        for it in items[i:i + cols]:
            fn(r, it)
    return g


def feature_tile(parent, glyph, title, desc, dark=False, num=None):
    c = V(parent, "Feature", gap=16, pad=32, cornerRadius=R_MD, sh="fill",
          fill="#FFFFFF0A" if dark else WHITE, stroke="#FFFFFF1F" if dark else LINE, strokeWeight=1)
    top = H(c, "Top", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    icon(top, glyph, GOLD if dark else PAPER3, INK, 52, 16)
    if num:
        T(top, num, "h4", "#FFFFFF33" if dark else LINE, fontStyle="Italic")
    T(c, title, "title", ON_INK if dark else INK)
    T(c, desc, "small", ON_INK2 if dark else INK3, sizingH="fill")
    return c


def cta_band(pg, line1="Not sure where to go?", accent="Let's talk it through.", sub="Tell us how you like to travel. A Hidden Miles specialist will send a personalised itinerary — free, within 24 hours.", img="paris"):
    w = V(pg, "CTA", pad=[SEC_S, SIDE, SEC, SIDE], sh="fill")
    c = H(w, "CTA card", gap=0, fill=INK, cornerRadius=36, clip=True, sh="fill")
    l = V(c, "Copy", gap=28, pad=[72, 72, 72, 72], sh="fill")
    kicker(l, None, "Free trip planning", dark=True)
    headline(l, line1, accent, "h2", dark=True)
    T(l, sub, "lead", ON_INK2, w=500)
    b = H(l, "Buttons", gap=12)
    button(b, "Plan my trip", "primary", "lg", arrow=True)
    button(b, "Chat on WhatsApp", "ghost-light", "lg")
    pr = H(l, "Proof", gap=24, crossAlign="center")
    for s in ("✓  Reply in 24 hrs", "✓  No planning fee", "✓  4.9★ rated"):
        T(pr, s, "small-b", ON_INK2, fontSize=13)
    r = frame(c, "Photo", None, w=520, h=520, fill=INK)
    image(r, img)
    rect(r, 520, 520, grad([(0, INK + "FF"), (0.25, INK + "00")], (0, 0.5), (1, 0.5)), "Fade")
    stamp(r, 340, 340, 140)


def faq(parent, items):
    l = V(parent, "FAQ", gap=0, sh="fill")
    for i, (q, a) in enumerate(items):
        it = V(l, "FAQ item", gap=14, pad=[28, 4, 28, 4], sh="fill", stroke=LINE, strokeTopWeight=1)
        h = H(it, "Question", mainAlign="spaceBetween", crossAlign="center", sh="fill", gap=24)
        T(h, q, "title")
        icon(h, "−" if i == 0 else "+", INK if i == 0 else PAPER3, GOLD if i == 0 else INK, 36)
        if i == 0:
            T(it, a, "body", INK2, sizingH="fill")
    return l


def stat(parent, v, k, dark=False, size="h2", sh="hug"):
    s = V(parent, "Stat", gap=6, sh=sh)
    T(s, v, size, ON_INK if dark else INK)
    T(s, k, "small", ON_INK2 if dark else INK3)
    return s


# ================================================================== PAGES
def p_home(x):
    pg = page("01 Home — Desktop", x)
    nav(pg, "Home")
    # hero: editorial split with collage, stamp and a docked search bar
    hero = V(pg, "Hero", gap=56, pad=[64, SIDE, 0, SIDE], sh="fill")
    top = H(hero, "Top", gap=64, sh="fill", crossAlign="center")
    c = V(top, "Copy", gap=32, sh="fill")
    kicker(c, None, "Group tours · Family holidays · Private escapes")
    hl = V(c, "Headline", gap=0)
    T(hl, "Journeys that", "display", INK)
    T(hl, "stay with you", "display", GOLD_D, fontStyle="Italic")
    T(hl, "long after.", "display", INK)
    T(c, "Thoughtfully planned trips across India and the world — with a tour leader from day one, honest all-inclusive prices and a real person on call, always.", "lead", INK2, w=500)
    b = H(c, "Buttons", gap=12, crossAlign="center")
    button(b, "Explore tours", "ink", "lg", arrow=True)
    button(b, "Talk to an expert", "outline", "lg")
    proof = H(c, "Proof", gap=16, crossAlign="center")
    av = H(proof, "Avatars", gap=-12)
    for i, col in enumerate((BLUE, GOLD_D, INK3, "#B4483D")):
        a = H(av, "Avatar", fill=col, cornerRadius=999, w=40, h=40, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", stroke=PAPER, strokeWeight=3)
        T(a, "ARMS"[i], "small-b", WHITE, fontSize=13)
    pt = V(proof, "Text", gap=2)
    rating(pt, "4.9", "12,400+ reviews")
    T(pt, "Loved by 1.2 million travellers", "small", INK3, fontSize=13)
    col = frame(top, "Collage", None, w=600, h=600)
    photo(col, "hero", 440, 560, [220, 220, R_LG, R_LG], "Arch photo", x=160, y=0)
    photo(col, "kerala", 240, 300, R_LG, "Inset photo", x=0, y=260, stroke=PAPER, strokeWeight=8)
    stamp(col, 452, 470, 140)
    pin = H(col, "Pin", gap=10, pad=[10, 16, 10, 10], fill=WHITE, cornerRadius=999, crossAlign="center", x=200, y=40, effects=shadow(12, 32, "1F"))
    icon(pin, "◉", GOLD, INK, 32)
    pv = V(pin, "T", gap=0)
    T(pv, "Gulmarg, Kashmir", "small-b", INK, fontSize=13)
    T(pv, "34.05° N · 74.38° E", "small", MUTED, fontSize=12)
    # search
    sb = H(hero, "Search bar", gap=0, pad=10, fill=WHITE, cornerRadius=24, sh="fill", crossAlign="center", stroke=LINE, strokeWeight=1, effects=shadow(24, 56, "1A"))
    for i, (k, v, g) in enumerate([("Where to", "Search destinations", "◉"), ("When", "Any month", "◷"), ("Trip style", "Group tour", "✦"), ("Travellers", "2 adults", "☺")]):
        if i:
            dashed(sb, LINE, vertical=True, length=44, name="Divider")
        f = H(sb, "Field", gap=14, pad=[12, 20, 12, 20], sh="fill", crossAlign="center")
        icon(f, g, PAPER3, INK, 40)
        t = V(f, "T", gap=2)
        T(t, k, "label", INK3, fontSize=11)
        T(t, v, "body-b", MUTED if i == 0 else INK)
    button(sb, "Search trips", "primary", "lg", arrow=True)
    qs = H(hero, "Quick links", gap=10, crossAlign="center", sh="fill")
    T(qs, "Popular:", "small-b", INK3)
    for s in ("Kashmir in spring", "Women's Special", "Honeymoons", "Europe 2027", "Under ₹50k"):
        chip(qs, s)
    # stats ribbon
    st = H(pg, "Stats", pad=[SEC_S, SIDE, 0, SIDE], gap=0, sh="fill")
    for i, (v, k) in enumerate([("42 years", "of crafting holidays"), ("1.2M+", "travellers hosted"), ("500+", "expert tour leaders"), ("60+", "destinations worldwide")]):
        cell = V(st, "Stat", gap=8, pad=[0, 32, 0, 0 if i == 0 else 32], sh="fill", stroke=LINE if i else None, strokeLeftWeight=1 if i else 0)
        T(cell, v, "h2")
        T(cell, k, "small", INK3)
    # destinations bento
    s = section(pg, "Destinations")
    section_head(s, "01", "Destinations", "Where will you", "wander next?",
                 right=lambda h: (lambda t: [chip(t, o, i == 0, count=n) for i, (o, n) in enumerate([("All", 60), ("India", 24), ("International", 36)])])(H(h, "Filter", gap=8)))
    bento = H(s, "Bento", gap=24, sh="fill")
    dest_card(bento, "kashmir", "Kashmir", "Houseboats, meadows & Mughal gardens", "12 tours", "34.08° N  74.79° E", 588, 640, big=True)
    g = V(bento, "Grid", gap=24, sh="fill")
    for row in [[("kerala", "Kerala", "Backwaters & tea hills", "9 tours", "9.49° N"), ("rajasthan", "Rajasthan", "Forts, dunes & palaces", "11 tours", "26.91° N")],
                [("japan", "Japan", "Temples & cherry blossom", "4 tours", "35.01° N"), ("bali", "Bali", "Rice terraces & temples", "6 tours", "8.51° S")]]:
        r = H(g, "Row", gap=24, sh="fill")
        for d in row:
            dest_card(r, d[0], d[1], d[2], d[3], d[4], 282, 308)
    m = H(s, "More", mainAlign="center", sh="fill")
    button(m, "See all 60 destinations", "outline", "md", arrow=True)
    # tours
    t = section(pg, "Featured tours", PAPER2)
    section_head(t, "02", "Handpicked departures", "Tours our travellers", "love most.",
                 right=lambda h: button(h, "View all 64 tours", "outline", "md", arrow=True))
    tabs = H(t, "Tabs", gap=8)
    for i, o in enumerate(["Bestsellers", "Departing soon", "Under ₹60k", "Women's Special", "International"]):
        chip(tabs, o, i == 0)
    r = H(t, "Cards", gap=32, sh="fill")
    for tr in TOURS[:3]:
        tour_card(r, tr)
    # how we travel (dark) — with contour motif
    wu = frame(pg, "Why us", None, fill=INK, w=W, h=860, clip=True)
    contours(wu, W, 860)
    inner = H(wu, "Inner", gap=80, pad=[SEC, SIDE, SEC, SIDE], w=W, sh="fixed")
    l = V(inner, "Left", gap=48, sh="fill")
    section_head(l, "03", "The Hidden Miles way", "Four decades of", "the little things.", dark=True)
    grid = V(l, "Features", gap=20, sh="fill")
    for row in [[("₹", "Honest, all-inclusive prices", "Flights, stays, meals and guides — no add-ons at checkout.", "01"), ("✓", "A leader on every trip", "500+ trained leaders travel with you, day one to home.", "02")],
                [("☎", "24×7 real-person support", "WhatsApp a human, whatever the hour or the time zone.", "03"), ("◆", "Flexible, protected bookings", "Free date changes up to 30 days out. Payments protected.", "04")]]:
        rr = H(grid, "Row", gap=20, sh="fill")
        for gph, ti, d, n in row:
            feature_tile(rr, gph, ti, d, dark=True, num=n)
    q = V(inner, "Testimonial", gap=28, pad=44, fill=PAPER, cornerRadius=R_LG, w=440, sh="fixed")
    T(q, "“", "display", GOLD, fontSize=96, lineHeight=56)
    T(q, "Our Kashmir trip was flawless — from the houseboat on Dal Lake to the pony ride in Pahalgam. Imran, our leader, felt like family by day two.", "h4", INK, fontStyle="Regular", lineHeight=36, sizingH="fill")
    a = H(q, "Author", gap=14, crossAlign="center")
    av = H(a, "Avatar", fill=BLUE, cornerRadius=999, w=52, h=52, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
    T(av, "AD", "small-b", WHITE)
    an = V(a, "Name", gap=2)
    T(an, "Ananya Deshpande", "body-b")
    T(an, "Magical Kashmir · Oct 2026", "small", INK3)
    dashed(q, LINE, length=340)
    n = H(q, "Pager", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    rating(n, "4.9", "12,400+")
    ar = H(n, "Arrows", gap=8)
    icon(ar, "←", PAPER3, INK, 44); icon(ar, "→", INK, GOLD, 44)
    # speciality strip
    sp = section(pg, "Ways to travel")
    section_head(sp, "04", "Speciality tours", "Travel that fits", "the way you live.",
                 right=lambda h: button(h, "All speciality tours", "outline", "md", arrow=True))
    r = H(sp, "Cards", gap=24, sh="fill")
    for img, ti, n in [("couple", "Honeymoons", "18 trips"), ("group", "Spiritual journeys", "12 trips"), ("ladakh", "Himalayan adventures", "9 trips"), ("europe", "Women's Special", "14 trips")]:
        cc = V(r, "Speciality", gap=18, sh="fill")
        photo(cc, img, 282, 360, R_LG, sh="fill")
        hh = V(cc, "Meta", gap=4, sh="fill")
        T(hh, ti, "h4", sizingH="fill")
        T(hh, n, "small", INK3)
    cta_band(pg)
    footer(pg)


def p_tours(x):
    pg = page("02 Group Tours — Desktop", x)
    nav(pg, "Group Tours")
    page_hero(pg, ["Home", "Group Tours"], "Every departure,", "in one place.",
              "64 escorted group tours across India and the world. All-inclusive, small groups, a tour leader from day one.", "group",
              extra=lambda c: (lambda r: [stat(r, v, k, size="h3") for v, k in [("64", "tours"), ("312", "departures"), ("4.9★", "average rating")]])(H(c, "Stats", gap=48)),
              coords="LADAKH · 34.15° N  77.58° E")
    body = H(pg, "Body", gap=48, pad=[0, SIDE, SEC, SIDE], sh="fill")
    side = V(body, "Filters", gap=32, pad=28, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, w=300, sh="fixed")
    hh = H(side, "Head", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(hh, "Filters", "title")
    T(hh, "Reset", "small-b", BLUE_D)

    def group(title):
        g = V(side, title, gap=14, sh="fill")
        T(g, title, "label", INK3)
        return g
    g = group("Region")
    r = H(g, "Chips", gap=8, wrap=True, crossGap=8, sh="fill")
    for i, o in enumerate(["All", "India", "International"]):
        chip(r, o, i == 1)
    g = group("Travel style")
    for i, (o, n) in enumerate([("Group tour", 38), ("Women's Special", 9), ("Family", 14), ("Adventure", 7), ("Luxury", 5)]):
        rr = H(g, "Checkbox", gap=12, crossAlign="center", sh="fill")
        box = H(rr, "Box", fill=INK if i in (0, 2) else WHITE, stroke=None if i in (0, 2) else LINE, strokeWeight=1.5, cornerRadius=6, w=20, h=20, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
        if i in (0, 2):
            T(box, "✓", "label", GOLD, fontSize=12, letterSpacing=0)
        T(rr, o, "small", INK, sizingH="fill")
        T(rr, str(n), "small", MUTED, fontSize=13)
    for title, val in [("Destination", "All destinations"), ("Departure month", "Any month")]:
        g = group(title)
        s = H(g, "Select", pad=[13, 16, 13, 16], fill=PAPER2, cornerRadius=14, mainAlign="spaceBetween", sh="fill")
        T(s, val, "small-b", INK)
        T(s, "⌄", "small-b", INK3)
    for title, lo, hi, a, b in [("Budget per person", "₹25,000", "₹1,20,000", 0.0, 0.42), ("Duration", "5 days", "12 days", 0.2, 0.8)]:
        g = group(title)
        tr = frame(g, "Slider", None, w=244, h=22)
        rect(tr, 244, 4, PAPER3, "Track", y=9, cornerRadius=2)
        rect(tr, 244 * (b - a), 4, INK, "Range", x=244 * a, y=9, cornerRadius=2)
        for p in (a, b):
            node("ellipse", tr, "Thumb", {"fill": WHITE, "stroke": INK, "strokeWeight": 2.5, "effects": shadow(2, 6, "33")}, width=22, height=22, x=max(0, 244 * p - 11), y=0)
        rr = H(g, "Values", mainAlign="spaceBetween", sh="fill")
        T(rr, lo, "small", INK2, fontSize=13); T(rr, hi, "small", INK2, fontSize=13)
    button(side, "Show 24 tours", "ink", "md", fill_w=True)
    res = V(body, "Results", gap=28, sh="fill")
    tb = H(res, "Toolbar", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    l = V(tb, "Count", gap=4)
    T(l, "24 tours in India", "h3")
    T(l, "Showing group tours and family holidays", "small", INK3)
    r = H(tb, "Controls", gap=10, crossAlign="center")
    s = H(r, "Sort", gap=10, pad=[11, 18, 11, 18], fill=WHITE, cornerRadius=999, stroke=LINE, strokeWeight=1.5, crossAlign="center")
    T(s, "Sort by", "small", INK3); T(s, "Recommended  ⌄", "small-b", INK)
    vt = H(r, "View", pad=4, fill=PAPER3, cornerRadius=999, gap=4)
    chip(vt, "▦  Grid", True)
    v2 = H(vt, "Chip", pad=[10, 18, 10, 18], cornerRadius=999); T(v2, "☰  List", "small-b", INK2)
    ac = H(res, "Applied", gap=8, crossAlign="center")
    for f in ["India  ✕", "Group tour  ✕", "Family  ✕", "Under ₹1.2L  ✕"]:
        c = H(ac, "Applied chip", pad=[8, 14, 8, 14], cornerRadius=999, fill=BLUE_L); T(c, f, "small-b", BLUE_D, fontSize=13)
    T(ac, "Clear all", "small-b", INK3, fontSize=13)
    row_grid(res, [TOURS[0], TOURS[1], TOURS[3], TOURS[4], TOURS[5], TOURS[2]], 2, lambda r, t: tour_card(r, t, img_h=260, est_w=412), gap=28, rgap=32)
    help_ = H(res, "Help banner", gap=24, pad=28, fill=GOLD_L, cornerRadius=R_MD, crossAlign="center", sh="fill")
    icon(help_, "☎", GOLD, INK, 52)
    hv = V(help_, "T", gap=4, sh="fill")
    T(hv, "Can't find the right dates?", "title")
    T(hv, "We run private departures for groups of 6 or more — any date, any route.", "small", INK2)
    button(help_, "Ask a specialist", "ink", "md", arrow=True)
    pgn = H(res, "Pagination", gap=8, mainAlign="center", crossAlign="center", sh="fill")
    for p in ["←", "1", "2", "3", "→"]:
        icon(pgn, p, INK if p == "1" else WHITE, GOLD if p == "1" else INK, 44, stroke=None if p == "1" else LINE, strokeWeight=1.5)
    T(pgn, "  Showing 1–6 of 24", "small", INK3)
    footer(pg)


def p_tour_detail(x):
    pg = page("03 Tour Detail — Desktop", x)
    nav(pg, "Group Tours")
    top = V(pg, "Header", gap=28, pad=[40, SIDE, 40, SIDE], sh="fill")
    crumbs(top, ["Home", "Group Tours", "Kashmir", "Magical Kashmir"])
    th = H(top, "Title row", mainAlign="spaceBetween", crossAlign="max", sh="fill")
    tl = V(th, "Title", gap=16)
    tg = H(tl, "Badges", gap=8)
    badge(tg, "Bestseller"); badge(tg, "Group tour", "blue"); badge(tg, "Family friendly", "success")
    T(tl, "Magical Kashmir", "h1")
    mr = H(tl, "Meta", gap=20, crossAlign="center")
    rating(mr, "4.9", "210 reviews")
    for m in ["8 days · 7 nights", "Srinagar → Gulmarg → Pahalgam → Sonmarg", "Max 24 travellers"]:
        T(mr, "·", "small", LINE); T(mr, m, "small", INK2)
    ac = H(th, "Actions", gap=10)
    button(ac, "Save", "light", "sm", icon="♡"); button(ac, "Share", "light", "sm", icon="↗"); button(ac, "Brochure PDF", "light", "sm", icon="↓")
    gal = H(pg, "Gallery", gap=12, pad=[0, SIDE, 0, SIDE], sh="fill")
    big = photo(gal, "kashmir", 708, 480, R_LG, "Main")
    btn = H(big, "All photos", gap=8, pad=[10, 16, 10, 16], fill=WHITE, cornerRadius=999, x=24, y=416)
    T(btn, "▦  View all 24 photos", "small-b", INK, fontSize=13)
    gr = V(gal, "Thumbs", gap=12, sh="fill")
    for row in (("hero", "ladakh"), ("group", "aurora")):
        rr = H(gr, "Row", gap=12, sh="fill")
        for k in row:
            photo(rr, k, 234, 234, R_MD, "Thumb", sh="fill")
    mb = H(pg, "Main", gap=72, pad=[56, SIDE, SEC, SIDE], sh="fill")
    main = V(mb, "Content", gap=64, sh="fill")
    tabs = H(main, "Tabs", gap=4, sh="fill", stroke=LINE, strokeBottomWeight=1)
    for i, t in enumerate(["Overview", "Itinerary", "Inclusions", "Dates & prices", "Reviews", "FAQs"]):
        tb = V(tabs, "Tab", gap=14, pad=[0, 16, 0, 16], crossAlign="center")
        T(tb, t, "body-b", INK if i == 0 else INK3, fontStyle="Bold" if i == 0 else "SemiBold")
        rect(tb, 10, 3, GOLD if i == 0 else "#00000000", "Indicator", sizingH="fill", cornerRadius=2)
    qf = H(main, "Quick facts", gap=0, pad=[24, 8, 24, 8], sh="fill", fill=WHITE, cornerRadius=R_MD, stroke=LINE, strokeWeight=1)
    for i, (g, k, v) in enumerate([("◷", "Duration", "8D / 7N"), ("⛰", "Activity", "Moderate"), ("☼", "Best time", "Apr – Oct"), ("✈", "Starts in", "Srinagar")]):
        c = H(qf, "Fact", gap=14, pad=[0, 24, 0, 24], crossAlign="center", sh="fill", stroke=LINE if i else None, strokeLeftWeight=1 if i else 0)
        icon(c, g, PAPER3, INK, 44)
        cc = V(c, "T", gap=2)
        T(cc, k, "label", INK3, fontSize=11); T(cc, v, "body-b")
    ov = V(main, "Overview", gap=24, sh="fill")
    kicker(ov, "01", "Overview")
    T(ov, "Why you'll love it", "h3")
    T(ov, "Float across Dal Lake at sunrise, ride the Gulmarg gondola to 13,000 ft and walk Pahalgam's meadows with a tour leader who knows every shortcut. Comfortable houseboat and hotel stays, most meals and every transfer are included.", "lead", INK2, sizingH="fill")
    row_grid(ov, ["A night on a heritage houseboat", "Gulmarg Gondola, phases 1 & 2", "Sunset shikara ride on Dal Lake", "Mughal gardens & Shankaracharya", "Aru & Betaab valley day trip", "A traditional Kashmiri wazwan"], 2,
             lambda r, s: (lambda c: (icon(c, "✓", GOLD_L, GOLD_D, 28), T(c, s, "body-b")))(H(r, "Highlight", gap=14, crossAlign="center", sh="fill")), gap=24, rgap=16)
    it = V(main, "Itinerary", gap=28, sh="fill")
    ih = H(it, "Head", mainAlign="spaceBetween", crossAlign="max", sh="fill")
    hv = V(ih, "T", gap=16); kicker(hv, "02", "Itinerary"); T(hv, "Day by day", "h3")
    T(ih, "Expand all days", "small-b", BLUE_D)
    days = [("Arrive Srinagar · Dal Lake", "Airport welcome, houseboat check-in and an evening shikara ride as the lake lights up.", "Houseboat", "D"),
            ("Srinagar old city & gardens", "Nishat and Shalimar Bagh, Shankaracharya temple and the wooden mosques of the old city.", "Houseboat", "B · D"),
            ("Gulmarg · Meadow of flowers", "Gondola to Kongdoori and Apharwat — snow underfoot, even in summer.", "Hotel, Gulmarg", "B · D"),
            ("Pahalgam via saffron fields", None, None, None), ("Aru & Betaab valleys", None, None, None), ("Sonmarg day excursion", None, None, None),
            ("Free day in Srinagar", None, None, None), ("Fly home", None, None, None)]
    tl = V(it, "Timeline", gap=0, sh="fill")
    for i, (t, d, stay, meals) in enumerate(days):
        row = H(tl, "Day", gap=24, sh="fill")
        rail = V(row, "Rail", crossAlign="center", w=48, sh="fixed")
        dot = H(rail, "Day number", fill=INK if d else WHITE, stroke=None if d else LINE, strokeWeight=1.5, cornerRadius=999, w=48, h=48, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
        T(dot, f"{i + 1:02d}", "small-b", GOLD if d else INK2)
        if i < len(days) - 1:
            dashed(rail, LINE, vertical=True, length=120 if d else 32)
        card = V(row, "Card", gap=10, pad=[12, 0, 28 if d else 20, 0], sh="fill")
        hh = H(card, "Head", mainAlign="spaceBetween", crossAlign="center", sh="fill")
        hv = H(hh, "T", gap=12, crossAlign="center")
        T(hv, f"Day {i + 1}", "label", GOLD_D, fontSize=11)
        T(hv, t, "title")
        T(hh, "−" if d else "+", "title", INK3)
        if d:
            T(card, d, "body", INK2, sizingH="fill")
            m = H(card, "Facts", gap=8)
            badge(m, "Stay · " + stay, "paper"); badge(m, "Meals · " + meals, "paper")
    inc = H(main, "Inclusions", gap=24, sh="fill")
    for title, items, ok in [("What's included", ["7 nights in houseboat & 4★ hotels", "Daily breakfast & dinner", "All transfers in a private coach", "Gulmarg gondola, phase 1", "Tour leader throughout"], True),
                             ("Not included", ["Flights to & from Srinagar", "Lunches & personal expenses", "Pony rides & optional activities", "Travel insurance"], False)]:
        c = V(inc, title, gap=16, pad=32, fill=WHITE if ok else PAPER2, cornerRadius=R_MD, stroke=LINE, strokeWeight=1, sh="fill")
        T(c, title, "title")
        for s in items:
            r = H(c, "Item", gap=12, crossAlign="center")
            icon(r, "✓" if ok else "✕", "#E5F4EC" if ok else "#FBEAE7", SUCCESS if ok else DANGER, 24)
            T(r, s, "small", INK2)
    rv = frame(main, "Reviews", None, fill=INK, w=720, h=240, cornerRadius=R_LG, clip=True, sh="fill")
    contours(rv, 720, 240, n=6, cx=0.9, cy=0.5)
    rin = H(rv, "Inner", gap=40, pad=40, w=720, sh="fixed", crossAlign="center")
    sc = V(rin, "Score", gap=6)
    T(sc, "4.9", "display", ON_INK, fontSize=72, lineHeight=72)
    T(sc, "★★★★★", "small-b", GOLD)
    T(sc, "210 verified reviews", "small", ON_INK2, fontSize=13)
    q = V(rin, "Quote", gap=14, sh="fill")
    T(q, "“The houseboat night and Gulmarg snow were magical. Imran made it feel like a family trip.”", "h4", ON_INK, fontStyle="Italic", sizingH="fill")
    T(q, "Ananya Deshpande · Oct 2026  →  Read all reviews", "small-b", GOLD)
    # booking card
    sb = V(mb, "Booking card", gap=24, pad=32, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, w=392, sh="fixed", effects=shadow(24, 56, "14"))
    pr = V(sb, "Price", gap=6)
    r = H(pr, "Was", gap=10, crossAlign="center")
    T(r, "₹64,500", "small", MUTED, textDecoration="strikethrough"); badge(r, "Save ₹5,600", "success")
    r2 = H(pr, "Now", gap=8, crossAlign="max")
    T(r2, "₹58,900", "h2", INK, fontFamily="Manrope", fontStyle="ExtraBold", letterSpacing=-1)
    T(r2, "per person", "small", INK3)
    T(pr, "Twin sharing · taxes included", "small", MUTED, fontSize=13)
    dashed(sb, LINE, length=320)
    dh = H(sb, "Dates head", mainAlign="spaceBetween", sh="fill"); T(dh, "Departure date", "label", INK3); T(dh, "All 8 →", "small-b", BLUE_D, fontSize=13)
    dg = V(sb, "Dates", gap=8, sh="fill")
    for row in [[("Fri, 12 Dec", "6 seats · filling fast", True, True), ("Fri, 19 Dec", "Sold out", False, None)], [("Fri, 26 Dec", "3 seats · filling fast", False, True), ("Fri, 9 Jan", "18 seats left", False, False)]]:
        rr = H(dg, "Row", gap=8, sh="fill")
        for d, s_, on, low in row:
            c = V(rr, "Date", gap=4, pad=[12, 14, 12, 14], cornerRadius=14, fill=INK if on else (PAPER2 if low is None else WHITE), stroke=None if on else LINE, strokeWeight=1.5, sh="fill")
            T(c, d, "small-b", PAPER if on else (MUTED if low is None else INK), textDecoration="strikethrough" if low is None else "none")
            T(c, s_, "small", GOLD if on else (DANGER if low else INK3), fontSize=12)
    T(sb, "Departure city", "label", INK3)
    city = H(sb, "City", pad=[13, 16, 13, 16], fill=WHITE, cornerRadius=14, stroke=LINE, strokeWeight=1.5, mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(city, "Mumbai · flight included", "small-b"); T(city, "⌄", "small-b", INK3)
    T(sb, "Travellers", "label", INK3)
    for lab, sub_, n in (("Adults", "12+ years", 2), ("Children", "5 – 11 years", 1)):
        trv = H(sb, "Travellers", mainAlign="spaceBetween", crossAlign="center", pad=[10, 10, 10, 16], fill=PAPER2, cornerRadius=14, sh="fill")
        tc = V(trv, "T", gap=0); T(tc, lab, "small-b"); T(tc, sub_, "small", INK3, fontSize=12)
        stp = H(trv, "Stepper", gap=14, crossAlign="center")
        icon(stp, "−", WHITE, INK, 34, stroke=LINE, strokeWeight=1.5); T(stp, str(n), "body-b"); icon(stp, "+", INK, GOLD, 34)
    tot = V(sb, "Total", gap=10, sh="fill")
    for k, v, b in [("2 adults × ₹58,900", "₹1,17,800", False), ("1 child × ₹44,200", "₹44,200", False), ("Pay now to reserve (25%)", "₹39,585", True)]:
        rr = H(tot, "Line", mainAlign="spaceBetween", sh="fill")
        T(rr, k, "small-b" if b else "small", INK if b else INK2); T(rr, v, "small-b" if b else "small", INK if b else INK2)
    button(sb, "Reserve my seats", "primary", "lg", arrow=True, fill_w=True)
    button(sb, "Ask a question", "outline", "md", fill_w=True)
    tr = V(sb, "Trust", gap=8)
    for s in ("Free date change up to 30 days before", "Balance due 30 days before travel", "Secure payment · UPI, cards, EMI"):
        rr = H(tr, "Point", gap=10, crossAlign="center"); T(rr, "✓", "small-b", SUCCESS, fontSize=13); T(rr, s, "small", INK2, fontSize=13)
    help_ = H(sb, "Expert", gap=12, pad=14, fill=PAPER2, cornerRadius=14, crossAlign="center", sh="fill")
    av = H(help_, "Avatar", fill=INK3, cornerRadius=999, w=40, h=40, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center"); T(av, "NK", "small-b", WHITE, fontSize=13)
    hv = V(help_, "T", gap=0, sh="fill"); T(hv, "Talk to Nisha, Kashmir expert", "small-b", fontSize=13); T(hv, "Usually replies in 5 min", "small", INK3, fontSize=12)
    icon(help_, "☎", INK, GOLD, 36)
    sim = section(pg, "Similar", PAPER2)
    section_head(sim, None, "You might also love", "More journeys", "to inspire you.", right=lambda h: button(h, "View all tours", "outline", "md", arrow=True))
    r = H(sim, "Cards", gap=32, sh="fill")
    for t in (TOURS[3], TOURS[4], TOURS[5]):
        tour_card(r, t)
    footer(pg)


INDIA = [("kashmir", "Kashmir", "Houseboats & meadows", "12 tours", "34.08° N"), ("kerala", "Kerala", "Backwaters & tea hills", "9 tours", "9.49° N"),
         ("rajasthan", "Rajasthan", "Forts, dunes & palaces", "11 tours", "26.91° N"), ("ladakh", "Ladakh", "High passes & monasteries", "7 tours", "34.15° N"),
         ("hero", "Himachal", "Pine valleys & hill towns", "8 tours", "31.10° N"), ("group", "North East", "Living roots & tea estates", "5 tours", "25.57° N")]
INTL = [("europe", "Europe", "12 countries, one trip", "8 tours", "46.82° N"), ("japan", "Japan", "Temples & bullet trains", "4 tours", "35.01° N"),
        ("bali", "Bali", "Rice terraces & temples", "6 tours", "8.51° S"), ("dubai", "Dubai", "Skylines & desert camps", "5 tours", "25.20° N"),
        ("maldives", "Maldives", "Overwater villas", "3 tours", "3.20° N"), ("thailand", "Thailand", "Islands & street food", "6 tours", "8.09° N")]


def p_destinations(x):
    pg = page("04 Destinations — Desktop", x)
    nav(pg, "Destinations")
    page_hero(pg, ["Home", "Destinations"], "Sixty places", "we know by heart.",
              "From houseboats in Srinagar to overwater villas in the Maldives — pick a place, and we'll handle everything else.", "aurora",
              extra=lambda c: (lambda s: (T(s, "⌕", "title", INK), T(s, "Search a destination…", "body", MUTED)))(H(c, "Search", gap=14, pad=[16, 22, 16, 22], fill=WHITE, cornerRadius=999, stroke=LINE, strokeWeight=1.5, w=460, sh="fixed", crossAlign="center")),
              coords="TROMSØ · 69.65° N  18.96° E")
    for i, (title, acc, num, data) in enumerate([("Across", "India.", "01", INDIA), ("Around", "the world.", "02", INTL)]):
        s = section(pg, title, PAPER2 if i else None, pad=(SEC_S if i == 0 else SEC, SIDE, SEC, SIDE))
        section_head(s, num, "India" if i == 0 else "International", title, acc,
                     right=lambda h, n=len(data): T(h, f"Showing {n} of {24 if n == 6 else 36}  ·  View all →", "small-b", BLUE_D))
        row_grid(s, data, 3, lambda r, d: dest_card(r, d[0], d[1], d[2], d[3], d[4], 378, 440), gap=32)
    cta_band(pg)
    footer(pg)


def p_destination_detail(x):
    pg = page("05 Destination Detail — Desktop", x)
    nav(pg, "Destinations")
    hw = V(pg, "Hero", pad=[24, 24, 0, 24], sh="fill")
    card = frame(hw, "Hero card", None, fill=INK, w=1392, h=640, cornerRadius=36, clip=True)
    image(card, "kashmir")
    rect(card, 1392, 640, grad([(0, INK + "66"), (0.4, INK + "00"), (1, INK + "F2")]), "Scrim")
    tb = H(card, "Top", w=1248, sh="fixed", mainAlign="spaceBetween", x=72, y=40)
    crumbs(tb, ["Home", "Destinations", "Kashmir"], dark=True)
    coord(tb, "34.08° N · 74.79° E · 1,585 m")
    c = V(card, "Copy", gap=20, w=900, sh="fixed", x=72, y=344)
    kicker(c, None, "Paradise on earth", dark=True)
    T(c, "Kashmir", "display", ON_INK, fontSize=120, lineHeight=116, letterSpacing=-4)
    T(c, "Houseboats on Dal Lake, saffron fields, Mughal gardens and meadows that stay green all summer.", "lead", ON_INK2, w=620)
    stamp(card, 1172, 428, 140)
    fw = V(pg, "Facts", pad=[40, SIDE, 0, SIDE], sh="fill")
    fb = H(fw, "Bar", gap=0, pad=[28, 0, 28, 0], fill=WHITE, cornerRadius=R_MD, stroke=LINE, strokeWeight=1, sh="fill")
    for i, (g, k, v) in enumerate([("☼", "Best time", "April – October"), ("◷", "Ideal trip", "6 – 8 days"), ("✈", "Fly into", "Srinagar (SXR)"), ("₹", "Tours from", "₹38,900 pp")]):
        cc = H(fb, "Fact", gap=14, pad=[0, 28, 0, 28], crossAlign="center", sh="fill", stroke=LINE if i else None, strokeLeftWeight=1 if i else 0)
        icon(cc, g, PAPER3, INK, 48)
        t = V(cc, "T", gap=2); T(t, k, "label", INK3, fontSize=11); T(t, v, "body-b")
    ab = H(pg, "About", gap=96, pad=[SEC_S, SIDE, SEC_S, SIDE], sh="fill")
    l = V(ab, "Text", gap=28, sh="fill")
    kicker(l, "01", "About Kashmir")
    headline(l, "Slow mornings on the lake,", "snow by afternoon.", "h2")
    T(l, "Our Kashmir tours are paced for families and first-timers: comfortable stays, short drives and a tour leader who has walked every trail. Pair it with Ladakh for a two-week Himalayan circuit.", "lead", INK2, sizingH="fill")
    button(l, "Plan a private Kashmir trip", "outline", "md", arrow=True)
    r = V(ab, "Highlights", gap=0, w=500, sh="fixed")
    for i, (t, d) in enumerate([("Dal Lake & houseboats", "Shikara rides, floating markets, heritage stays"), ("Gulmarg & Sonmarg", "Gondola rides and glacier walks"),
                                ("Mughal gardens", "Nishat, Shalimar & Chashme Shahi"), ("Kashmiri cuisine", "Wazwan feasts and kahwa by the fire")]):
        cc = H(r, "Highlight", gap=24, pad=[24, 0, 24, 0], crossAlign="center", sh="fill", stroke=LINE, strokeTopWeight=1 if i else 0)
        T(cc, f"0{i + 1}", "h3", GOLD_D, fontStyle="Italic")
        tv = V(cc, "T", gap=4, sh="fill")
        T(tv, t, "title"); T(tv, d, "small", INK3)
    s = section(pg, "Tours", PAPER2)
    section_head(s, "02", "12 departures", "Kashmir", "tours.",
                 right=lambda h: (lambda t: [chip(t, o, i == 0) for i, o in enumerate(["All", "Group", "Family", "Honeymoon"])])(H(h, "Filter", gap=8)))
    r = H(s, "Cards", gap=32, sh="fill")
    for t in (TOURS[0], TOURS[3], TOURS[1]):
        tour_card(r, t)
    s2 = section(pg, "Nearby")
    section_head(s2, "03", "Combine it with", "Nearby", "destinations.")
    r = H(s2, "Row", gap=32, sh="fill")
    for d in (INDIA[3], INDIA[4], INDIA[2]):
        dest_card(r, d[0], d[1], d[2], d[3], d[4], 378, 360)
    cta_band(pg, "Kashmir,", "your way.", "Private departures, honeymoon stays or a family trip with grandparents — tailored within 24 hours.", "kashmir")
    footer(pg)


SPECIALS = [("couple", "Honeymoons & Celebrations", "Private villas, candlelit dinners and just enough adventure.", "18 trips", "♥"),
            ("group", "Spiritual Journeys", "Temple towns and guided yatras planned with care for elders.", "12 trips", "✿"),
            ("ladakh", "Himalayan Adventures", "High passes, frozen lakes and trails that reward the brave.", "9 trips", "⛰"),
            ("beach", "Family Holidays", "Easy pacing, connecting rooms and something for every age.", "22 trips", "☺"),
            ("maldives", "Luxury Escapes", "Five-star stays, private guides and seamless upgrades.", "11 trips", "♛"),
            ("europe", "Women's Special", "All-women departures, led by women tour leaders.", "14 trips", "✦")]


def p_speciality(x):
    pg = page("06 Speciality Tours — Desktop", x)
    nav(pg, "Speciality Tours")
    page_hero(pg, ["Home", "Speciality Tours"], "Travel that fits", "the way you live.",
              "Honeymoons, yatras, Himalayan treks and women-only departures — journeys built around a purpose, not just a place.", "couple",
              coords="CAPPADOCIA · 38.64° N  34.83° E")
    s = section(pg, "Collections", pad=(0, SIDE, SEC, SIDE), gap=96)
    for i, (img, title, desc, n, g) in enumerate(SPECIALS):
        row = H(s, "Collection", gap=80, sh="fill", crossAlign="center")
        def visual(parent):
            v = frame(parent, "Visual", None, w=580, h=420)
            photo(v, img, 580, 420, R_LG)
            badge(v, n, "paper", x=24, y=24)
            return v
        def copy(parent):
            cp = V(parent, "Copy", gap=24, sh="fill")
            T(cp, f"0{i + 1}", "h2", GOLD_D, fontStyle="Italic")
            T(cp, title, "h2", sizingH="fill")
            T(cp, desc, "lead", INK2, sizingH="fill")
            b = H(cp, "Buttons", gap=16, crossAlign="center")
            button(b, "Explore " + title.split(" ")[0].lower(), "ink", "md", arrow=True)
            T(b, "Ask a specialist", "small-b", BLUE_D)
            return cp
        if i % 2 == 0:
            visual(row); copy(row)
        else:
            copy(row); visual(row)
    st = frame(pg, "How it works", None, fill=INK, w=W, h=620, clip=True)
    contours(st, W, 620, cx=0.15, cy=0.8)
    inner = V(st, "Inner", gap=56, pad=[SEC, SIDE, SEC, SIDE], w=W, sh="fixed")
    section_head(inner, None, "How it works", "From first call", "to final goodbye.", dark=True)
    r = H(inner, "Steps", gap=20, sh="fill")
    for i, (t, d) in enumerate([("Tell us your dream", "Dates, budget and the kind of trip you love."), ("We design it around you", "A specialist drafts an itinerary in 24 hours."),
                                ("We fine-tune together", "Swap hotels, add days, change pace — free."), ("You travel, we handle it", "24×7 support and a leader on the ground.")]):
        feature_tile(r, f"{i + 1}", t, d, dark=True, num=f"0{i + 1}")
    cta_band(pg)
    footer(pg)


def p_experiences(x):
    pg = page("07 Experiences — Desktop", x)
    nav(pg, "")
    page_hero(pg, ["Home", "Experiences"], "Moments worth", "the whole journey.",
              "Cooking with a Kerala family, sunrise at Pangong, a private aarti in Varanasi — the moments our travellers remember most.", "aurora",
              coords="TROMSØ · 69.65° N  18.96° E")
    s = section(pg, "Featured", pad=(0, SIDE, SEC, SIDE))
    feat = H(s, "Feature", gap=0, fill=INK, cornerRadius=36, clip=True, sh="fill")
    im = frame(feat, "Photo", None, w=640, h=480, fill=INK)
    image(im, "aurora")
    fc = V(feat, "Copy", gap=24, pad=64, sh="fill")
    badge(fc, "Experience of the month")
    headline(fc, "Chasing the northern", "lights in Tromsø.", "h3", dark=True)
    T(fc, "Three nights on the edge of the Arctic with a photographer-guide, reindeer sledding and a cabin dinner under the aurora.", "body", ON_INK2, sizingH="fill")
    button(fc, "See this experience", "primary", "md", arrow=True)
    h = H(s, "Filter row", mainAlign="spaceBetween", crossAlign="center", sh="fill", pad=[40, 0, 0, 0])
    T(h, "All experiences", "h3")
    f = H(h, "Filter", gap=8)
    for i, o in enumerate(["All", "Culture", "Food", "Nature", "Adventure"]):
        chip(f, o, i == 0)
    exps = [("couple", "Balloon sunrise over Cappadocia", "Turkey · Adventure", "3 hrs"), ("kerala", "Houseboat cooking class", "Kerala · Food", "Half day"),
            ("ladakh", "The ride to Pangong Lake", "Ladakh · Adventure", "Full day"), ("japan", "Tea ceremony in Gion", "Japan · Culture", "2 hrs"),
            ("bali", "Temple blessing at dawn", "Bali · Culture", "3 hrs"), ("maldives", "Snorkel with manta rays", "Maldives · Nature", "Half day")]

    def ex(r, e):
        c = V(r, "Experience", gap=18, sh="fill")
        m = photo(c, e[0], 378, 300, R_LG, "Photo", sh="fill")
        badge(m, e[3], "paper", x=20, y=20)
        T(c, e[2], "label", BLUE_D)
        T(c, e[1], "h4", sizingH="fill")
    row_grid(s, exps, 3, ex, gap=32, rgap=56)
    cta_band(pg)
    footer(pg)


def p_personalised(x):
    pg = page("08 Personalised — Desktop", x)
    nav(pg, "Personalised")
    hero = H(pg, "Hero", gap=80, pad=[72, SIDE, SEC, SIDE], sh="fill", crossAlign="center")
    l = V(hero, "Copy", gap=32, sh="fill")
    kicker(l, None, "Personalised holidays")
    hl = V(l, "Headline", gap=0)
    T(hl, "A holiday built", "h1"); T(hl, "around you,", "h1", GOLD_D, fontStyle="Italic"); T(hl, "not a brochure.", "h1")
    T(l, "No fixed departures and no one-size-fits-all. Tell us who's travelling and what you love — a specialist designs the rest.", "lead", INK2, w=500)
    r = H(l, "Proof", gap=48)
    for v, k in [("24 hrs", "to your first itinerary"), ("₹0", "planning fee"), ("4.9★", "guest rating")]:
        stat(r, v, k, size="h3")
    f = V(hero, "Planner", gap=24, pad=40, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, w=520, sh="fixed", effects=shadow(24, 56, "14"))
    hh = H(f, "Head", mainAlign="spaceBetween", crossAlign="center", sh="fill"); T(hh, "Start planning", "h3"); T(hh, "Step 1 of 3", "small-b", INK3)
    st = H(f, "Progress", gap=8, sh="fill")
    for i in range(3):
        rect(st, 10, 4, GOLD if i == 0 else PAPER3, "Bar", sizingH="fill", cornerRadius=2)
    field(f, "Where would you like to go?", "Kerala, Bali, Japan…", placeholder=True, hint="Not sure yet? Leave it blank — we'll suggest a few.")
    r = H(f, "Row", gap=16, sh="fill")
    field(r, "When", "December 2026", suffix="⌄"); field(r, "How long", "7–9 days", suffix="⌄")
    T(f, "Trip style", "small-b")
    cs = H(f, "Chips", gap=8, wrap=True, crossGap=8, sh="fill")
    for i, o in enumerate(["Honeymoon", "Family", "Adventure", "Slow & relaxed", "Luxury", "Spiritual"]):
        chip(cs, o, i == 1)
    button(f, "Continue", "ink", "lg", arrow=True, fill_w=True)
    T(f, "Takes 2 minutes · no payment needed", "small", INK3, fontSize=13, textAlign="center", sizingH="fill")
    s = section(pg, "How it works", PAPER2)
    section_head(s, "01", "How it works", "Four steps to", "your perfect trip.")
    r = H(s, "Steps", gap=0, sh="fill")
    for i, (t, d) in enumerate([("Tell us your dream", "A ten-minute call or a two-minute form."), ("We design it around you", "A tailored itinerary within 24 hours."),
                                ("We fine-tune together", "Unlimited changes, never a fee."), ("You travel, we handle the rest", "Tickets, stays, guides and 24×7 support.")]):
        c = V(r, "Step", gap=20, pad=[0, 32, 0, 0], sh="fill")
        rr = H(c, "Rail", gap=12, crossAlign="center", sh="fill")
        icon(rr, f"{i + 1}", INK, GOLD, 48)
        if i < 3:
            dashed(rr, LINE, length=150)
        T(c, t, "title"); T(c, d, "small", INK3, sizingH="fill")
    s2 = section(pg, "Tailor")
    section_head(s2, "02", "What we can tailor", "Made for every", "kind of traveller.")
    items = [("♥", "Honeymoons & celebrations", "Private villas, intimate dinners and just enough adventure."), ("☺", "Family & multi-generation", "Easy pacing and something for every age."),
             ("✦", "Milestone occasions", "Birthdays, anniversaries and reunions."), ("⚑", "Private group journeys", "Friends, clubs and communities, end to end."),
             ("✎", "Special-interest travel", "Photography, food, wildlife, temples or trekking."), ("◷", "Flexible dates & pacing", "Travel when you want, for as long as you want.")]
    row_grid(s2, items, 3, lambda r, it: feature_tile(r, *it), gap=24)
    cta_band(pg, "Rather talk it through?", "Call a specialist.", "Mon–Sat, 9:30 am to 7:00 pm. Or leave your number and we'll call you back within the hour.", "couple")
    footer(pg)


def p_corporate(x):
    pg = page("09 Corporate — Desktop", x)
    nav(pg, "")
    page_hero(pg, ["Home", "Corporate"], "Corporate travel,", "minus the headache.",
              "Offsites, incentives and events people actually remember — planned by one team, end to end.", "group",
              extra=lambda c: (lambda r: (button(r, "Request a proposal", "ink", "lg", arrow=True), button(r, "Download deck", "outline", "lg")))(H(c, "Buttons", gap=12)),
              coords="SPITI · 32.24° N  78.03° E")
    logos = V(pg, "Logos", gap=28, pad=[0, SIDE, SEC_S, SIDE], sh="fill", crossAlign="center")
    T(logos, "Trusted by 300+ teams across India", "label", INK3)
    lr = H(logos, "Row", gap=0, mainAlign="spaceBetween", sh="fill", crossAlign="center")
    for n in ["NORTHWIND", "Acme Labs", "BLUEPEAK", "Finch & Co", "ORBITAL", "Kestrel"]:
        T(lr, n, "h4", "#8FC6D6", fontFamily="Manrope", fontStyle="ExtraBold", letterSpacing=0.5)
    s = section(pg, "Services", PAPER2)
    section_head(s, "01", "What we do", "Built for groups", "of 20 to 2,000.")
    items = [("⚑", "Corporate offsites", "Strategy days in the hills or by the sea."), ("✦", "Incentive travel", "Trips that reward and motivate your best people."),
             ("▣", "MICE & conferences", "Venues, AV, delegates and stays — handled."), ("◆", "Leadership retreats", "Quiet, beautiful places to think big."),
             ("☺", "Team-building journeys", "Treks, regattas and cook-offs that bond teams."), ("⇄", "Multi-city programmes", "Several cities, one seamless itinerary.")]
    row_grid(s, items, 3, lambda r, it: feature_tile(r, *it), gap=24)
    w = frame(pg, "Proposal", None, fill=INK, w=W, h=860, clip=True)
    contours(w, W, 860, cx=0.2, cy=0.6)
    inner = H(w, "Inner", gap=96, pad=[SEC, SIDE, SEC, SIDE], w=W, sh="fixed")
    l = V(inner, "Why", gap=40, sh="fill")
    section_head(l, "02", "Why teams choose us", "The details are", "the difference.", dark=True)
    for t, d in [("One team, end to end", "A dedicated account manager from brief to wrap-up."), ("Risk handled quietly", "Insurance, medical cover and contingency plans built in."),
                 ("Clean, compliant billing", "GST invoices, cost centres and one consolidated bill.")]:
        r = H(l, "Point", gap=20, sh="fill")
        icon(r, "✓", GOLD, INK, 40)
        c = V(r, "T", gap=4, sh="fill")
        T(c, t, "title", ON_INK); T(c, d, "small", ON_INK2)
    f = V(inner, "Form", gap=20, pad=40, fill=PAPER, cornerRadius=R_LG, w=520, sh="fixed")
    T(f, "Request a proposal", "h3")
    T(f, "We reply within one working day.", "small", INK3)
    r = H(f, "Row", gap=16, sh="fill"); field(r, "Your name", "Priya Nair"); field(r, "Company", "Acme Labs")
    r = H(f, "Row", gap=16, sh="fill"); field(r, "Work email", "priya@acme.com"); field(r, "Group size", "80–120", suffix="⌄")
    field(f, "Tell us about the event", "Offsite in Goa, 3 nights, March…", placeholder=True, tall=True)
    button(f, "Send request", "ink", "lg", arrow=True, fill_w=True)
    footer(pg)


def p_about(x):
    pg = page("10 About — Desktop", x)
    nav(pg, "About")
    hero = V(pg, "Hero", gap=32, pad=[72, SIDE, 72, SIDE], sh="fill", crossAlign="center")
    crumbs(hero, ["Home", "About us"])
    hl = V(hero, "Headline", gap=0, crossAlign="center")
    T(hl, "Since 1984, in the", "display", INK, textAlign="center")
    T(hl, "business of memories.", "display", GOLD_D, fontStyle="Italic", textAlign="center")
    T(hero, "One family, one idea: travel should feel effortless, honest and personal.", "lead", INK2, textAlign="center")
    band = frame(pg, "Photo band", None, w=W, h=520)
    for i, (k, xx, yy, ww, hh) in enumerate([("group", 24, 40, 420, 440), ("kerala", 468, 0, 504, 520), ("hero", 996, 60, 420, 400)]):
        photo(band, k, ww, hh, R_LG, x=xx, y=yy)
    stamp(band, 880, 400, 150)
    st = H(pg, "Story", gap=96, pad=[SEC, SIDE, SEC, SIDE], sh="fill")
    l = V(st, "Left", gap=24, w=460, sh="fixed")
    kicker(l, "01", "The Hidden Miles way")
    headline(l, "A family business,", "grown one trip at a time.", "h2", w=460)
    r = V(st, "Right", gap=28, sh="fill")
    T(r, "It started with a single bus to Kashmir and 32 travellers. Four decades later we've hosted 1.2 million guests — and we still answer the phone like it's our very first trip.", "lead", INK, sizingH="fill")
    T(r, "Our tour leaders are trained in-house, our prices are all-inclusive, and every itinerary is walked by our own team before a single seat is sold.", "body", INK2, sizingH="fill")
    sr = H(r, "Stats", gap=0, sh="fill", pad=[28, 0, 0, 0], stroke=LINE, strokeTopWeight=1)
    for v, k in [("1.2M+", "travellers"), ("500+", "tour leaders"), ("60+", "destinations"), ("4.9★", "rating")]:
        stat(sr, v, k, size="h3", sh="fill")
    tl = section(pg, "Timeline", PAPER2)
    section_head(tl, "02", "The journey so far", "Four decades,", "a few milestones.")
    r = H(tl, "Timeline", gap=0, sh="fill")
    for i, (y, t) in enumerate([("1984", "First group tour to Kashmir — one bus, 32 travellers"), ("1996", "Our first international departure, to Europe"),
                                ("2008", "Launched Women's Special departures"), ("2018", "Welcomed our millionth traveller"), ("2026", "Opened the Personalised Holidays studio")]):
        c = V(r, "Milestone", gap=20, sh="fill", pad=[0, 24, 0, 0])
        rr = H(c, "Rail", gap=0, crossAlign="center", sh="fill")
        node("ellipse", rr, "Dot", {"fill": GOLD if i == 4 else INK, "stroke": PAPER2, "strokeWeight": 4}, width=20, height=20)
        dashed(rr, INK3 if i < 4 else "#00000000", length=200)
        T(c, y, "h3", GOLD_D if i == 4 else INK, fontStyle="Italic")
        T(c, t, "small", INK2, sizingH="fill")
    v = section(pg, "Values")
    section_head(v, "03", "What we stand for", "Three promises", "we keep.")
    r = H(v, "Values", gap=24, sh="fill")
    for g, t, d in [("☎", "Real humans, always", "Call, WhatsApp or email. The same team answers before and during your trip."),
                    ("♥", "Care for every traveller", "Elders, kids, solo travellers — we plan for the people, not just the places."),
                    ("₹", "Honest by default", "All-inclusive prices. What you see is exactly what you pay.")]:
        feature_tile(r, g, t, d)
    cta_band(pg, "Come travel", "with us.", "Join 1.2 million travellers who've trusted Hidden Miles with their holidays.", "hero")
    footer(pg)


def p_contact(x):
    pg = page("11 Contact — Desktop", x)
    nav(pg, "")
    top = V(pg, "Header", gap=24, pad=[80, SIDE, 64, SIDE], sh="fill", crossAlign="center")
    kicker(top, None, "Contact us")
    hl = V(top, "Headline", gap=0, crossAlign="center")
    T(hl, "Let's plan something", "h1", INK, textAlign="center"); T(hl, "wonderful.", "h1", GOLD_D, fontStyle="Italic", textAlign="center")
    T(top, "Real people, Monday to Saturday, 9:30 am – 7:00 pm. We usually reply within the hour.", "lead", INK2, textAlign="center")
    ch = H(pg, "Channels", gap=24, pad=[0, SIDE, 64, SIDE], sh="fill")
    for g, t, v, cta, bg in [("☎", "Call us", "+91 98204 12345", "Call now", INK), ("✆", "WhatsApp", "+91 98204 12345", "Start a chat", "#1C9A6C"), ("✉", "Email", "hello@hiddenmiles.in", "Write to us", BLUE)]:
        c = V(ch, "Channel", gap=20, pad=32, fill=WHITE, cornerRadius=R_MD, stroke=LINE, strokeWeight=1, sh="fill")
        icon(c, g, bg, WHITE, 52, 16)
        tv = V(c, "T", gap=4); T(tv, t, "label", INK3); T(tv, v, "title")
        T(c, cta + "  →", "small-b", BLUE_D)
    m = H(pg, "Main", gap=32, pad=[0, SIDE, SEC, SIDE], sh="fill")
    f = V(m, "Form", gap=24, pad=48, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, sh="fill")
    T(f, "Send us a message", "h3")
    r = H(f, "Row", gap=16, sh="fill"); field(r, "Full name", "Your name", True); field(r, "Phone", "+91", True)
    r = H(f, "Row", gap=16, sh="fill"); field(r, "Email", "you@email.com", True); field(r, "I'm interested in", "Group tour", suffix="⌄")
    field(f, "Message", "Where and when would you like to travel?", True, tall=True)
    rr = H(f, "Submit", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(rr, "We never share your details.", "small", INK3)
    button(rr, "Send message", "ink", "lg", arrow=True)
    side = V(m, "Side", gap=24, w=420, sh="fixed")
    mp = frame(side, "Map", None, w=420, h=300, cornerRadius=R_LG, clip=True, fill="#DBEDF3")
    contours(mp, 420, 300, color=BLUE_D, alpha="33", n=8, cx=0.5, cy=0.5, seed=2.4)
    pin = H(mp, "Pin", gap=10, pad=[10, 16, 10, 10], fill=INK, cornerRadius=999, crossAlign="center", x=120, y=124, effects=shadow(10, 24, "40"))
    icon(pin, "◉", GOLD, INK, 28)
    T(pin, "Meridian House", "small-b", PAPER, fontSize=13)
    o = V(side, "Office", gap=12, pad=32, fill=INK, cornerRadius=R_LG, sh="fill")
    T(o, "Mumbai · Head office", "label", GOLD)
    T(o, "302, Meridian House", "h4", ON_INK)
    T(o, "Andheri East, Mumbai 400069\nMon – Sat · 9:30 am to 7:00 pm", "small", ON_INK2)
    T(o, "Get directions  ↗", "small-b", GOLD)
    q = section(pg, "FAQ", PAPER2)
    hh = H(q, "Layout", gap=96, sh="fill")
    hl = V(hh, "Left", gap=24, w=380, sh="fixed")
    kicker(hl, None, "Good to know")
    headline(hl, "Questions,", "answered.", "h2")
    T(hl, "Can't find yours? Call us — it's what we're here for.", "body", INK2, sizingH="fill")
    faq(hh, [("How do I book a Hidden Miles holiday?", "Pick a departure online and pay 25% to reserve, or call us and we'll book it for you. The balance is due 30 days before travel."),
             ("Can you customise an existing tour?", ""), ("Do you handle visas and travel insurance?", ""), ("What if my plans change after booking?", ""), ("Is there an EMI option?", "")])
    footer(pg)


def p_testimonials(x):
    pg = page("12 Guest Stories — Desktop", x)
    nav(pg, "")
    top = H(pg, "Header", gap=80, pad=[72, SIDE, 64, SIDE], sh="fill", crossAlign="max")
    l = V(top, "Copy", gap=24, sh="fill")
    crumbs(l, ["Home", "Guest stories"])
    headline(l, "12,400 travellers,", "in their own words.", "h1")
    sc = H(top, "Score", gap=32, pad=32, fill=INK, cornerRadius=R_LG, crossAlign="center")
    s = V(sc, "S", gap=6)
    T(s, "4.9", "display", ON_INK, fontSize=72, lineHeight=72); T(s, "★★★★★", "small-b", GOLD); T(s, "12,400+ reviews", "small", ON_INK2, fontSize=13)
    bars = V(sc, "Bars", gap=10, w=220, sh="fixed")
    for star, pct, n in [(5, 0.88, "10.9k"), (4, 0.09, "1.1k"), (3, 0.02, "248"), (2, 0.01, "84"), (1, 0.0, "31")]:
        r = H(bars, "Bar", gap=10, crossAlign="center", sh="fill")
        T(r, f"{star}★", "small-b", ON_INK2, fontSize=12)
        tr = frame(r, "Track", None, w=140, h=6, fill="#FFFFFF1A", cornerRadius=3)
        rect(tr, max(140 * pct, 2), 6, GOLD, "Fill", cornerRadius=3)
        T(r, n, "small", ON_INK2, fontSize=12)
    fl = H(pg, "Filters", gap=8, pad=[0, SIDE, 48, SIDE], sh="fill")
    for i, o in enumerate(["All stories", "Kashmir", "Kerala", "Europe", "Honeymoon", "Family", "Women's Special"]):
        chip(fl, o, i == 0)
    revs = [("Ananya Deshpande", "Magical Kashmir · Oct 2026", "Our Kashmir trip was flawless — from the houseboat on Dal Lake to the pony ride in Pahalgam. Imran felt like family by day two.", BLUE, "kashmir"),
            ("Rohan & Meera Shah", "Bali Bliss · Honeymoon", "Every detail was taken care of. The private villa dinner was the highlight of our honeymoon.", DANGER, None),
            ("Lakshmi Iyer", "Royal Rajasthan · Family", "Travelling with my 74-year-old mother was easy. The pace was perfect and the hotels were beautiful.", GOLD_D, None),
            ("Vikram Malhotra", "Grand Europe · Group", "Fourteen days, six countries and zero stress. Our leader knew every shortcut — and every great gelato shop.", SUCCESS, None),
            ("Farida Qureshi", "Women's Special · Japan", "I travelled solo and came back with twenty new friends. I felt safe and looked after throughout.", INK2, "japan"),
            ("Sanjay Kulkarni", "Ladakh Road Trip", "Acclimatisation days were well planned and the oxygen checks reassured my parents. Pangong was unreal.", BLUE_D, None)]

    def rc(parent, rv):
        name, trip, q, col, img = rv
        c = V(parent, "Review", gap=20, pad=32, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, sh="fill")
        if img:
            photo(c, img, 320, 200, R_MD, sh="fill")
        hh = H(c, "Top", mainAlign="spaceBetween", crossAlign="center", sh="fill")
        T(hh, "★★★★★", "small-b", GOLD)
        badge(hh, "Verified", "success")
        T(c, "“" + q + "”", "h4", INK, fontStyle="Regular", lineHeight=34, sizingH="fill")
        dashed(c, LINE, length=300)
        a = H(c, "Author", gap=14, crossAlign="center")
        av = H(a, "Avatar", fill=col, cornerRadius=999, w=44, h=44, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
        T(av, "".join(w[0] for w in name.split() if w[0].isalpha() and w[0].isupper())[:2], "small-b", WHITE, fontSize=13)
        t = V(a, "T", gap=2); T(t, name, "body-b"); T(t, trip, "small", INK3, fontSize=13)
    g = H(pg, "Masonry", gap=24, pad=[0, SIDE, 56, SIDE], sh="fill", crossAlign="min")
    for colitems in (revs[0::3], revs[1::3], revs[2::3]):
        c = V(g, "Column", gap=24, sh="fill")
        for rv in colitems:
            rc(c, rv)
    lm = H(pg, "More", pad=[0, SIDE, SEC_S, SIDE], mainAlign="center", sh="fill")
    button(lm, "Load more stories", "outline", "md")
    cta_band(pg, "Ready to write", "your own story?")
    footer(pg)


def p_404(x):
    pg = page("13 Not Found — Desktop", x)
    nav(pg, "")
    w = frame(pg, "Body", None, w=W, h=720, fill=PAPER)
    contours(w, W, 720, color=INK, alpha="12", n=10, cx=0.5, cy=0.5)
    c = V(w, "Copy", gap=28, w=720, sh="fixed", crossAlign="center", x=360, y=150)
    T(c, "404 · 00.00° N  00.00° E", "label", GOLD_D)
    T(c, "Off the map.", "display", INK, textAlign="center")
    T(c, "This page took a detour. Let's get you back on route.", "lead", INK2, textAlign="center")
    b = H(c, "Buttons", gap=12)
    button(b, "Back to home", "ink", "lg", arrow=True); button(b, "Browse tours", "outline", "lg")
    footer(pg)


# ------------------------------------------------------------------ booking flow (group tours)
# Group-tour booking: pick a fixed departure date + departure city, count adults/children,
# then only the lead traveller's contact details are needed.
STEPS = ["Trip details", "Lead traveller", "Add-ons", "Payment"]

# departures: date, weekday, seats left, status, price (adult), note
DEPARTURES = [
    ("5 Dec", "Fri", 2, "filling", "₹58,900"), ("8 Dec", "Mon", 11, "open", "₹57,900"), ("12 Dec", "Fri", 6, "filling", "₹58,900"),
    ("15 Dec", "Mon", 14, "open", "₹57,900"), ("19 Dec", "Fri", 0, "sold", "₹62,400"), ("22 Dec", "Mon", 0, "sold", "₹62,400"),
    ("26 Dec", "Fri", 3, "filling", "₹64,500"), ("29 Dec", "Mon", 5, "filling", "₹64,500"), ("2 Jan", "Fri", 9, "open", "₹59,900"),
    ("5 Jan", "Mon", 16, "open", "₹56,900"), ("9 Jan", "Fri", 18, "open", "₹56,900"), ("12 Jan", "Mon", 20, "open", "₹55,900"),
    ("16 Jan", "Fri", 22, "open", "₹55,900"), ("19 Jan", "Mon", 24, "open", "₹55,900"), ("23 Jan", "Fri", 22, "open", "₹56,900"),
    ("26 Jan", "Mon", 25, "open", "₹55,500"), ("30 Jan", "Fri", 19, "open", "₹56,900"), ("2 Feb", "Mon", 26, "open", "₹55,500"),
]
CITIES = [("Mumbai", "Flight + tour · meet at Srinagar airport", "Included", True),
          ("Delhi", "Flight + tour · meet at Srinagar airport", "– ₹2,400", False),
          ("Bengaluru", "Flight + tour · meet at Srinagar airport", "+ ₹3,800", False),
          ("Pune", "Flight via Mumbai", "+ ₹1,900", False),
          ("Join in Srinagar", "Tour only · book your own flights", "– ₹9,500", False)]
# price model: 2 adults × 58,900 + 1 child × 44,200 = 1,62,000; early bird –11,200
SUM = dict(base_ad="₹1,17,800", base_ch="₹44,200", early="– ₹11,200", ins="₹4,350", gon="₹5,400",
           gst_no="₹7,540", gst_add="₹8,028", total_no="₹1,58,340", total_add="₹1,68,578",
           due="₹42,145", balance="₹1,26,433", full="₹1,65,206", emi="₹28,096")


def stepper_ctl(parent, label, sub, value, minus_on=True):
    r = H(parent, "Counter", gap=16, pad=[18, 20, 18, 20], cornerRadius=16, fill=WHITE, stroke=LINE, strokeWeight=1, crossAlign="center", sh="fill")
    tv = V(r, "T", gap=4, sh="fill")
    T(tv, label, "body-b", sizingH="fill")
    T(tv, sub, "small", INK3, sizingH="fill")
    st = H(r, "Stepper", gap=16, crossAlign="center")
    icon(st, "−", WHITE, INK if minus_on else LINE, 40, stroke=LINE, strokeWeight=1.5)
    T(st, str(value), "title", w=20, textAlign="center")
    icon(st, "+", INK, GOLD, 40)
    return r


def date_tile(parent, d, wd, seats, status, price, on=False):
    """Compact departure chip: weekday, date, price, seats left (colour carries the status)."""
    sold = status == "sold"
    c = V(parent, "Departure date", gap=2, pad=[10, 10, 10, 12], cornerRadius=12, sh="fill",
          fill=INK if on else (PAPER2 if sold else WHITE), stroke=None if on else LINE, strokeWeight=1.5)
    T(c, f"{wd} {d}", "small-b", PAPER if on else (MUTED if sold else INK), fontSize=13.5, letterSpacing=-0.2, textDecoration="strikethrough" if sold else "none")
    T(c, "Sold out" if sold else price, "small", ON_INK2 if on else (MUTED if sold else INK2), fontSize=13)
    T(c, "Waitlist" if sold else f"{seats} seats left", "small-b",
      GOLD if on else (MUTED if sold else (DANGER if status == "filling" else SUCCESS)), fontSize=12)
    return c


def checkout_header(pg, step):
    """Focused checkout header: logo, progress stepper, help line. No main nav, fewer exits."""
    h = H(pg, "Checkout header", pad=[20, SIDE, 20, SIDE], mainAlign="spaceBetween", crossAlign="center", sh="fill",
          fill=WHITE, stroke=LINE, strokeBottomWeight=1)
    logo(h)
    st = H(h, "Stepper", gap=10, crossAlign="center")
    for i, s_ in enumerate(STEPS):
        if i:
            dashed(st, GOLD_D if i <= step else LINE, length=28, fill=False)
        done, cur = i < step, i == step
        it = H(st, "Step", gap=10, crossAlign="center")
        icon(it, "✓" if done else str(i + 1), GOLD if done else (INK if cur else WHITE), INK if done else (GOLD if cur else INK3), 32,
             stroke=None if (done or cur) else LINE, strokeWeight=1.5)
        T(it, s_, "small-b", INK if (done or cur) else INK3)
    r = V(h, "Help", gap=2, crossAlign="max")
    T(r, "🔒 Secure checkout", "small-b", SUCCESS, fontSize=13)
    T(r, "Help: +91 98204 12345", "small", INK2, fontSize=13)


def summary(parent, cta, cta_kind="primary", addons=False, pay=False):
    sb = V(parent, "Order summary", gap=24, pad=32, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, w=420, sh="fixed", effects=shadow(16, 40, "0F"))
    top = H(sb, "Tour", gap=16, crossAlign="center", sh="fill")
    photo(top, "kashmir", 88, 88, 16)
    tv = V(top, "T", gap=4, sh="fill")
    T(tv, "Magical Kashmir", "h4", sizingH="fill")
    T(tv, "8 days · Group tour", "small", INK3)
    rating(tv, "4.9", "210")
    dashed(sb, LINE, length=356)
    facts = V(sb, "Facts", gap=12, sh="fill")
    for k, v in [("Departure", "Fri, 12 Dec 2026"), ("Returns", "Fri, 19 Dec 2026"), ("From", "Mumbai"), ("Travellers", "2 adults · 1 child")]:
        r = H(facts, "Fact", mainAlign="spaceBetween", sh="fill", gap=16)
        T(r, k, "small", INK3); T(r, v, "small-b", INK)
    T(facts, "Edit trip details", "small-b", BLUE_D, fontSize=13)
    dashed(sb, LINE, length=356)
    lines = V(sb, "Price", gap=12, sh="fill")
    rows = [("Adults · ₹58,900 × 2", SUM["base_ad"]), ("Child (5–11) · ₹44,200 × 1", SUM["base_ch"]), ("Early-bird saving", SUM["early"])]
    if addons:
        rows += [("Travel insurance × 3", SUM["ins"]), ("Gondola phase 2 × 3", SUM["gon"])]
    rows += [("GST (5%)", SUM["gst_add"] if addons else SUM["gst_no"])]
    for k, v in rows:
        r = H(lines, "Line", mainAlign="spaceBetween", sh="fill", gap=16)
        T(r, k, "small", INK2); T(r, v, "small-b", SUCCESS if v.startswith("–") else INK)
    tot = H(sb, "Total", mainAlign="spaceBetween", crossAlign="max", sh="fill", pad=[20, 0, 0, 0], stroke=LINE, strokeTopWeight=1)
    tl = V(tot, "L", gap=2); T(tl, "Total", "title"); T(tl, "3 travellers · incl. taxes", "small", INK3, fontSize=13)
    T(tot, SUM["total_add"] if addons else SUM["total_no"], "h3", INK, fontFamily="Manrope", fontStyle="ExtraBold", letterSpacing=-0.5)
    if pay:
        due = H(sb, "Due now", mainAlign="spaceBetween", crossAlign="center", pad=[14, 16, 14, 16], fill=GOLD_L, cornerRadius=14, sh="fill")
        T(due, "Due today (25%)", "small-b"); T(due, SUM["due"], "title")
    button(sb, cta, cta_kind, "lg", arrow=True, fill_w=True)
    tr = V(sb, "Trust", gap=10, sh="fill")
    for s_ in ("Free date change up to 30 days before travel", "Full refund if we cancel — no questions", "Your seats are held for 20 minutes"):
        r = H(tr, "Point", gap=10, crossAlign="center", sh="fill")
        icon(r, "✓", "#E5F4EC", SUCCESS, 22)
        T(r, s_, "small", INK2, fontSize=13, sizingH="fill")
    return sb


def checkout_page(name, x, step, title, accent, sub, timer=True):
    pg = page(name, x)
    checkout_header(pg, step)
    body = H(pg, "Body", gap=64, pad=[64, SIDE, SEC, SIDE], sh="fill", fill=PAPER2)
    main = V(body, "Main", gap=32, sh="fill")
    hd = V(main, "Head", gap=16, sh="fill")
    T(hd, f"Step {step + 1} of 4", "label", GOLD_D)
    headline(hd, title, accent, "h2")
    T(hd, sub, "body", INK2, sizingH="fill")
    if timer:
        tm = H(main, "Hold timer", gap=12, pad=[14, 20, 14, 20], fill=WHITE, cornerRadius=14, stroke=LINE, strokeWeight=1, crossAlign="center", sh="fill")
        icon(tm, "◷", GOLD_L, GOLD_D, 32)
        T(tm, "We're holding 3 seats on 12 Dec for you", "small-b", INK, sizingH="fill")
        T(tm, "18:42 left", "small-b", DANGER)
    return pg, body, main


def card(parent, title, sub=None, right=None):
    c = V(parent, title, gap=24, pad=36, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, sh="fill")
    h = H(c, "Head", mainAlign="spaceBetween", crossAlign="center", sh="fill", gap=16)
    tv = V(h, "T", gap=6, sh="fill")
    T(tv, title, "h4", sizingH="fill")
    if sub:
        T(tv, sub, "small", INK3, sizingH="fill")
    if right:
        right(h)
    return c


def radio(parent, title, desc, price, on=False):
    r = H(parent, "Option", gap=16, pad=20, cornerRadius=16, fill=BLUE_L if on else WHITE, stroke=BLUE if on else LINE,
          strokeWeight=1.5, crossAlign="center", sh="fill")
    dot = H(r, "Radio", w=22, h=22, sh="fixed", sv="fixed", cornerRadius=999, fill=WHITE, stroke=BLUE if on else LINE, strokeWeight=2,
            mainAlign="center", crossAlign="center")
    if on:
        node("ellipse", dot, "Dot", {"fill": BLUE}, width=10, height=10)
    tv = V(r, "T", gap=4, sh="fill")
    T(tv, title, "body-b", sizingH="fill"); T(tv, desc, "small", INK3, sizingH="fill")
    T(r, price, "small-b", SUCCESS if price.startswith("–") else INK)
    return r


def p_book_trip(x):
    pg, body, main = checkout_page("14 Booking · Trip details — Desktop", x, 0, "Plan your", "group departure.",
                                   "Pick a start date, where you'll join from and who's coming. Prices update as you go.", timer=False)
    c = card(main, "1. Choose a departure date", "Every departure is an escorted group of up to 26 travellers.")
    mo = H(c, "Months", gap=8)
    for i, m in enumerate(["Dec – Jan", "Feb – Mar", "Apr – May", "Jun – Aug"]):
        chip(mo, m, i == 0)
    row_grid(c, DEPARTURES, 6, lambda r, d: date_tile(r, *d, on=(d[0] == "12 Dec")), gap=8, rgap=8)
    c = card(main, "2. Departure city", "Where will you start? Flights from your city are included in the price.")
    for nm, d, p, on in CITIES:
        radio(c, nm, d, p, on)
    c = card(main, "3. Who's travelling?", "Children's prices apply to ages 5–11. Under 5 travel free on a parent's lap.")
    stepper_ctl(c, "Adults", "12 years and above · ₹58,900 each", 2)
    stepper_ctl(c, "Children", "5 – 11 years · ₹44,200 each", 1)
    stepper_ctl(c, "Infants", "Under 5 · free", 0, minus_on=False)
    note = H(c, "Note", gap=12, pad=[14, 18, 14, 18], fill=BLUE_L, cornerRadius=14, crossAlign="center", sh="fill")
    T(note, "ⓘ", "small-b", BLUE_D)
    T(note, "Travelling as 6 or more? You'll get a group discount of 5% at payment.", "small", BLUE_D, sizingH="fill")
    nav_ = H(main, "Actions", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(nav_, "← Back to tour", "small-b", INK2)
    button(nav_, "Continue", "ink", "lg", arrow=True)
    summary(body, "Hold 3 seats & continue", "primary")
    footer_min(pg)


def p_book_lead(x):
    pg, body, main = checkout_page("15 Booking · Lead traveller — Desktop", x, 1, "Who's", "leading the group?",
                                   "We only need the lead traveller's details now. We'll collect ID details for everyone 30 days before departure.")
    c = card(main, "Lead traveller", "Tickets, invoices and trip updates go to this person.")
    field(c, "Full name", "Ananya Deshpande", hint="As on government ID.")
    r = H(c, "Row", gap=20, sh="fill")
    field(r, "Email", "ananya@email.com")
    ph = V(r, "Field", gap=8, sh="fill")
    T(ph, "Phone", "small-b")
    box = H(ph, "Input", gap=0, fill=WHITE, cornerRadius=14, stroke=LINE, strokeWeight=1.5, sh="fill", crossAlign="center", clip=True)
    cc = H(box, "Code", gap=8, pad=[15, 16, 15, 16], fill=PAPER2, crossAlign="center", stroke=LINE, strokeRightWeight=1.5)
    T(cc, "🇮🇳 +91", "body-b"); T(cc, "⌄", "small-b", INK3)
    num = H(box, "Number", pad=[15, 18, 15, 18], sh="fill"); T(num, "98765 43210", "body")
    T(ph, "We'll send WhatsApp updates on this number.", "small", MUTED, fontSize=13)
    nat = V(c, "Nationality", gap=12, sh="fill")
    T(nat, "Nationality", "small-b")
    rr = H(nat, "Options", gap=12, sh="fill")
    for nm, on in (("Indian", True), ("Other nationality", False)):
        o = H(rr, "Option", gap=12, pad=[15, 18, 15, 18], cornerRadius=14, fill=BLUE_L if on else WHITE, stroke=BLUE if on else LINE, strokeWeight=1.5, crossAlign="center", sh="fill")
        bx = H(o, "Check", w=22, h=22, sh="fixed", sv="fixed", cornerRadius=6, fill=BLUE if on else WHITE, stroke=None if on else LINE, strokeWeight=1.5, mainAlign="center", crossAlign="center")
        if on:
            T(bx, "✓", "label", WHITE, fontSize=12, letterSpacing=0)
        T(o, nm, "body-b")
    T(nat, "Other nationalities may need a passport and visa — we'll guide you after booking.", "small", INK3, fontSize=13, sizingH="fill")
    c = card(main, "Anything we should know?", "Dietary needs, mobility, celebrations — optional.")
    field(c, "Special requests", "e.g. vegetarian meals, ground-floor room, anniversary on day 3…", True, tall=True)
    cons = H(main, "Consent", gap=14, crossAlign="center", sh="fill")
    bx = H(cons, "Box", fill=INK, cornerRadius=6, w=22, h=22, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
    T(bx, "✓", "label", GOLD, fontSize=12, letterSpacing=0)
    T(cons, "Send me trip updates on WhatsApp.", "small", INK2, sizingH="fill")
    nav_ = H(main, "Actions", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(nav_, "← Back to trip details", "small-b", INK2)
    button(nav_, "Continue to add-ons", "ink", "lg", arrow=True)
    summary(body, "Continue to add-ons", "ink")
    footer_min(pg)


def addon(parent, glyph, title, desc, price, on):
    r = H(parent, "Add-on", gap=20, pad=24, cornerRadius=R_MD, fill=WHITE, stroke=INK if on else LINE, strokeWeight=1.5 if on else 1, crossAlign="center", sh="fill")
    icon(r, glyph, GOLD_L if on else PAPER3, GOLD_D if on else INK, 52, 16)
    tv = V(r, "T", gap=4, sh="fill")
    hh = H(tv, "Title", gap=10, crossAlign="center")
    T(hh, title, "body-b")
    if on:
        badge(hh, "Popular", "success")
    T(tv, desc, "small", INK3, sizingH="fill")
    pv = V(r, "Price", gap=2, crossAlign="max")
    T(pv, price, "small-b"); T(pv, "per person", "small", MUTED, fontSize=12)
    tg = H(r, "Toggle", w=48, h=28, sh="fixed", sv="fixed", cornerRadius=999, fill=INK if on else LINE, pad=4, mainAlign="max" if on else "min", crossAlign="center")
    node("ellipse", tg, "Knob", {"fill": GOLD if on else WHITE}, width=20, height=20)


def p_book_addons(x):
    pg, body, main = checkout_page("16 Booking · Add-ons — Desktop", x, 2, "Make it", "even easier.",
                                   "Optional extras, chosen by past travellers on this tour. Added for all 3 travellers.")
    c = card(main, "Recommended for this tour")
    addon(c, "☂", "Travel insurance", "Medical cover up to ₹5 lakh, trip cancellation and lost baggage.", "₹1,450", True)
    addon(c, "⛰", "Gulmarg gondola — phase 2", "Ride on to Apharwat peak at 13,780 ft. Usually sells out on the day.", "₹1,800", True)
    addon(c, "⛵", "Extra night on the houseboat", "Arrive a day early and settle in slowly.", "₹6,200", False)
    addon(c, "✦", "Private room upgrade", "A room to yourselves instead of sharing with another family.", "₹9,500", False)
    c = card(main, "Have a promo code?")
    r = H(c, "Row", gap=12, sh="fill", crossAlign="max")
    field(r, "Code", "EARLYBIRD", sh="fill")
    button(r, "Apply", "outline", "lg")
    ok = H(c, "Applied", gap=10, crossAlign="center", pad=[12, 16, 12, 16], fill="#E5F4EC", cornerRadius=12, sh="fill")
    T(ok, "✓", "small-b", SUCCESS); T(ok, "EARLYBIRD applied — you save ₹11,200", "small-b", SUCCESS, sizingH="fill")
    nav_ = H(main, "Actions", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(nav_, "← Back to lead traveller", "small-b", INK2)
    button(nav_, "Continue to payment", "ink", "lg", arrow=True)
    summary(body, "Continue to payment", "ink", addons=True)
    footer_min(pg)


def p_book_payment(x):
    pg, body, main = checkout_page("17 Booking · Payment — Desktop", x, 3, "Almost", "there.",
                                   "Pay 25% now to confirm your seats. The balance is due on 12 Nov 2026 — we'll remind you twice.")
    c = card(main, "How much would you like to pay?")
    radio(c, "Reserve with 25%", f"{SUM['due']} today · {SUM['balance']} by 12 Nov 2026", SUM["due"], True)
    radio(c, "Pay in full", "One payment, nothing to remember — and 2% off.", SUM["full"])
    radio(c, "No-cost EMI", "6 months on HDFC, ICICI, Axis and SBI cards.", f"from {SUM['emi']}/mo")
    c = card(main, "Payment method")
    tabs = H(c, "Methods", gap=8, sh="fill")
    for i, m in enumerate(["UPI", "Card", "Net banking", "Wallet"]):
        t = H(tabs, "Method", gap=10, pad=[14, 18, 14, 18], cornerRadius=14, fill=INK if i == 0 else WHITE, stroke=None if i == 0 else LINE, strokeWeight=1.5,
              mainAlign="center", sh="fill")
        T(t, m, "small-b", PAPER if i == 0 else INK)
    up = H(c, "UPI", gap=32, pad=28, fill=PAPER2, cornerRadius=R_MD, sh="fill", crossAlign="center")
    qr = frame(up, "QR", None, w=148, h=148, fill=WHITE, cornerRadius=16, stroke=LINE, strokeWeight=1)
    for i in range(7):
        for j in range(7):
            if (i * 3 + j * 5 + i * j) % 3 != 0 or (i in (0, 6) and j in (0, 6)):
                rect(qr, 14, 14, INK, "Px", x=18 + i * 16, y=18 + j * 16, cornerRadius=3)
    uv = V(up, "Or", gap=16, sh="fill")
    T(uv, "Scan with any UPI app", "title")
    T(uv, "GPay, PhonePe, Paytm or your bank app. The page updates as soon as the payment goes through.", "small", INK2, sizingH="fill")
    r = H(uv, "Row", gap=12, sh="fill", crossAlign="max")
    field(r, "Or enter your UPI ID", "ananya@okhdfc", sh="fill")
    button(r, "Verify", "outline", "lg")
    card(main, "Billing & GST", "Optional — add your GSTIN to claim input credit.", right=lambda h: T(h, "Add", "small-b", BLUE_D))
    agree = H(main, "Agree", gap=14, crossAlign="center", sh="fill")
    bx = H(agree, "Box", fill=INK, cornerRadius=6, w=22, h=22, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
    T(bx, "✓", "label", GOLD, fontSize=12, letterSpacing=0)
    T(agree, "I agree to the booking terms, cancellation policy and privacy policy.", "small", INK2, sizingH="fill")
    nav_ = H(main, "Actions", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    T(nav_, "← Back to add-ons", "small-b", INK2)
    button(nav_, f"Pay {SUM['due']} securely", "primary", "lg", arrow=True)
    lg = H(main, "Badges", gap=24, crossAlign="center", mainAlign="center", sh="fill")
    for s_ in ("🔒 256-bit SSL", "PCI-DSS compliant", "Razorpay secured", "IATA accredited"):
        T(lg, s_, "small-b", INK3, fontSize=13)
    summary(body, f"Pay {SUM['due']} securely", "primary", addons=True, pay=True)
    footer_min(pg)


def p_book_confirmed(x):
    pg = page("18 Booking · Confirmed — Desktop", x)
    checkout_header(pg, 4)
    hero = frame(pg, "Confirmation", None, w=W, h=560, fill=INK, clip=True)
    contours(hero, W, 560, cx=0.5, cy=0.5, n=10)
    c = V(hero, "Copy", gap=24, w=760, sh="fixed", crossAlign="center", x=340, y=88)
    st = frame(c, "Stamp holder", None, w=140, h=140)
    stamp(st, 0, 0, 140, txt="BOOKED · SEE YOU IN KASHMIR · ")
    T(c, "You're going to Kashmir!", "h1", ON_INK, textAlign="center")
    T(c, "Booking HM-26-08713 is confirmed for 3 travellers. Tickets and a welcome pack are on their way to ananya@email.com.", "lead", ON_INK2, textAlign="center", w=640)
    b = H(c, "Buttons", gap=12)
    button(b, "View my booking", "primary", "lg", arrow=True); button(b, "Download invoice", "ghost-light", "lg")
    s = H(pg, "Details", gap=48, pad=[SEC_S, SIDE, SEC_S, SIDE], sh="fill")
    l = V(s, "Next", gap=32, sh="fill")
    kicker(l, None, "What happens next")
    T(l, "Your countdown to Dal Lake", "h3")
    steps = [("Today", "Payment received", "Confirmation and invoice sent to your email.", True),
             ("Within 48 hours", "Meet your tour leader", "Imran will add you to the group's WhatsApp and say hello.", False),
             ("12 Nov 2026", f"Balance due · {SUM['balance']}", "Plus ID details for all 3 travellers. We'll remind you 7 days and 1 day before.", False),
             ("5 Dec 2026", "Final trip pack", "Flight tickets from Mumbai, hotel list, packing guide and emergency contacts.", False),
             ("12 Dec 2026", "Group meets at Mumbai airport", "Look for the Hidden Miles flag at Terminal 2, 6:00 am.", False)]
    tl = V(l, "Timeline", gap=0, sh="fill")
    for i, (when, t, d, done) in enumerate(steps):
        row = H(tl, "Step", gap=24, sh="fill")
        rail = V(row, "Rail", crossAlign="center", w=40, sh="fixed")
        icon(rail, "✓" if done else str(i + 1), GOLD if done else WHITE, INK if done else INK3, 40, stroke=None if done else LINE, strokeWeight=1.5)
        if i < len(steps) - 1:
            dashed(rail, LINE, vertical=True, length=72)
        tv = V(row, "T", gap=6, pad=[6, 0, 32, 0], sh="fill")
        T(tv, when, "label", GOLD_D)
        T(tv, t, "title", sizingH="fill")
        T(tv, d, "small", INK2, sizingH="fill")
    r = V(s, "Booking", gap=20, w=440, sh="fixed")
    bc = V(r, "Booking card", gap=20, pad=32, fill=WHITE, cornerRadius=R_LG, stroke=LINE, strokeWeight=1, sh="fill")
    photo(bc, "kashmir", 376, 180, R_MD, sh="fill")
    T(bc, "Magical Kashmir", "h4")
    for k, v in [("Booking ref", "HM-26-08713"), ("Departure", "12 – 19 Dec 2026"), ("From", "Mumbai"), ("Travellers", "2 adults · 1 child"),
                 ("Paid", f"{SUM['due']} of {SUM['total_add']}"), ("Balance due", "12 Nov 2026")]:
        rr = H(bc, "Row", mainAlign="spaceBetween", sh="fill", gap=16)
        T(rr, k, "small", INK3); T(rr, v, "small-b")
    acts = V(r, "Actions", gap=12, sh="fill")
    button(acts, "Add dates to calendar", "outline", "md", fill_w=True, icon="◷")
    button(acts, "Share with your group", "light", "md", fill_w=True, icon="↗")
    cta_band(pg, "While you wait,", "get inspired.", "Read guest stories from Kashmir, or add a few days in Ladakh to make it a Himalayan circuit.", "ladakh")
    footer(pg)


def footer_min(pg):
    f = H(pg, "Checkout footer", pad=[28, SIDE, 28, SIDE], mainAlign="spaceBetween", crossAlign="center", fill=WHITE, sh="fill", stroke=LINE, strokeTopWeight=1)
    T(f, "© 2026 Hidden Miles Holidays Pvt. Ltd. · IATA accredited", "small", INK3, fontSize=13)
    T(f, "Booking terms   ·   Cancellation policy   ·   Privacy", "small-b", INK2, fontSize=13)


def m_trip(x):
    pg = page("M4 Booking · Trip details — Mobile", x, width=MW)
    h = H(pg, "Header", pad=[14, 20, 14, 20], mainAlign="spaceBetween", crossAlign="center", sh="fill", fill=WHITE, stroke=LINE, strokeBottomWeight=1)
    icon(h, "←", PAPER3, INK, 40)
    tv = V(h, "T", gap=0, crossAlign="center"); T(tv, "Trip details", "body-b"); T(tv, "Step 1 of 4", "small", INK3, fontSize=12)
    T(h, "🔒", "title", SUCCESS)
    pr = H(pg, "Progress", gap=6, pad=[12, 20, 0, 20], sh="fill")
    for i in range(4):
        rect(pr, 10, 4, GOLD if i == 0 else PAPER3, "Bar", sizingH="fill", cornerRadius=2)
    c = V(pg, "Body", gap=20, pad=[24, 20, 32, 20], sh="fill", fill=PAPER2)
    T(c, "Departure date", "title")
    row_grid(c, DEPARTURES[:6], 3, lambda r, d: date_tile(r, *d, on=(d[0] == "12 Dec")), gap=8, rgap=8)
    T(c, "Show all 18 dates  ⌄", "small-b", BLUE_D)
    T(c, "Departure city", "title")
    city = H(c, "Select", pad=[16, 18, 16, 18], fill=WHITE, cornerRadius=14, stroke=LINE, strokeWeight=1.5, mainAlign="spaceBetween", crossAlign="center", sh="fill")
    tv = V(city, "T", gap=2); T(tv, "Mumbai", "body-b"); T(tv, "Flight + tour", "small", INK3, fontSize=13)
    T(city, "⌄", "title", INK3)
    T(c, "Who's travelling?", "title")
    stepper_ctl(c, "Adults", "12+ years", 2)
    stepper_ctl(c, "Children", "5 – 11 years", 1)
    bar = V(pg, "Sticky bar", gap=10, pad=[16, 20, 28, 20], fill=WHITE, sh="fill", stroke=LINE, strokeTopWeight=1,
            effects=[{"type": "dropShadow", "color": INK + "1F", "offset": [0, -8], "radius": 24}])
    r = H(bar, "Total", mainAlign="spaceBetween", crossAlign="center", sh="fill")
    tv = V(r, "T", gap=0); T(tv, "3 travellers", "small", INK3, fontSize=13); T(tv, SUM["total_no"], "title")
    button(r, "Continue", "primary", "lg", arrow=True)


def m_payment(x):
    pg = page("M5 Booking · Payment — Mobile", x, width=MW)
    h = H(pg, "Header", pad=[14, 20, 14, 20], mainAlign="spaceBetween", crossAlign="center", sh="fill", fill=WHITE, stroke=LINE, strokeBottomWeight=1)
    icon(h, "←", PAPER3, INK, 40)
    tv = V(h, "T", gap=0, crossAlign="center"); T(tv, "Payment", "body-b"); T(tv, "Step 4 of 4", "small", INK3, fontSize=12)
    T(h, "🔒", "title", SUCCESS)
    pr = H(pg, "Progress", gap=6, pad=[12, 20, 0, 20], sh="fill")
    for i in range(4):
        rect(pr, 10, 4, GOLD, "Bar", sizingH="fill", cornerRadius=2)
    c = V(pg, "Body", gap=20, pad=[24, 20, 32, 20], sh="fill", fill=PAPER2)
    t = H(c, "Hold", gap=10, pad=[12, 16, 12, 16], fill=WHITE, cornerRadius=14, stroke=LINE, strokeWeight=1, crossAlign="center", sh="fill")
    T(t, "Seats held for you", "small-b", INK, sizingH="fill"); T(t, "18:42", "small-b", DANGER)
    sm = H(c, "Tour", gap=14, pad=16, fill=WHITE, cornerRadius=R_MD, stroke=LINE, strokeWeight=1, crossAlign="center", sh="fill")
    photo(sm, "kashmir", 64, 64, 14)
    tv = V(sm, "T", gap=2, sh="fill"); T(tv, "Magical Kashmir", "body-b"); T(tv, "12 Dec · Mumbai · 2 adults, 1 child", "small", INK3, fontSize=13, sizingH="fill")
    T(c, "How much to pay?", "title")
    radio(c, "Reserve with 25%", "Balance by 12 Nov", SUM["due"], True)
    radio(c, "Pay in full · 2% off", "One payment", SUM["full"])
    T(c, "Pay with", "title")
    for i, (m, d) in enumerate([("UPI", "GPay, PhonePe, Paytm"), ("Card", "Visa, Mastercard, RuPay"), ("Net banking", "All major banks")]):
        r = H(c, "Method", gap=14, pad=18, fill=WHITE, cornerRadius=16, stroke=INK if i == 0 else LINE, strokeWeight=1.5 if i == 0 else 1, crossAlign="center", sh="fill")
        tv = V(r, "T", gap=2, sh="fill"); T(tv, m, "body-b"); T(tv, d, "small", INK3, fontSize=13)
        T(r, "●" if i == 0 else "○", "title", INK if i == 0 else LINE)
    bar = V(pg, "Sticky pay bar", gap=10, pad=[16, 20, 28, 20], fill=WHITE, sh="fill", stroke=LINE, strokeTopWeight=1,
            effects=[{"type": "dropShadow", "color": INK + "1F", "offset": [0, -8], "radius": 24}])
    r = H(bar, "Total", mainAlign="spaceBetween", sh="fill")
    T(r, "Due today", "small", INK3); T(r, SUM["due"], "title")
    button(bar, f"Pay {SUM['due']} securely", "primary", "lg", arrow=True, fill_w=True)


# ------------------------------------------------------------------ mobile
MW = 390


def m_header(pg):
    n = H(pg, "Mobile header", pad=[14, 20, 14, 20], mainAlign="spaceBetween", crossAlign="center", sh="fill", fill=PAPER, stroke=LINE, strokeBottomWeight=1)
    logo(n, size=0.82)
    a = H(n, "Actions", gap=8)
    icon(a, "⌕", WHITE, INK, 42, stroke=LINE, strokeWeight=1.5)
    icon(a, "☰", INK, GOLD, 42)


def m_home(x):
    pg = page("M1 Home — Mobile", x, width=MW)
    m_header(pg)
    h = V(pg, "Hero", gap=24, pad=[32, 20, 0, 20], sh="fill")
    kicker(h, None, "Since 1984")
    hl = V(h, "Headline", gap=0)
    T(hl, "Journeys that", "h1", fontSize=48, lineHeight=52); T(hl, "stay with you.", "h1", GOLD_D, fontStyle="Italic", fontSize=48, lineHeight=52)
    T(h, "Small-group tours and private escapes, planned end to end.", "body", INK2, sizingH="fill")
    ph = frame(h, "Photo", None, w=350, h=300)
    photo(ph, "hero", 350, 300, R_LG)
    stamp(ph, 250, 214, 96)
    sb = V(h, "Search", gap=0, pad=8, fill=WHITE, cornerRadius=R_MD, sh="fill", stroke=LINE, strokeWeight=1, effects=shadow(16, 40, "14"))
    for i, (k, v) in enumerate([("Where to", "Kashmir, Kerala, Europe…"), ("When", "Any month")]):
        if i:
            dashed(sb, LINE, length=300)
        f = V(sb, "Field", gap=2, pad=[12, 14, 12, 14], sh="fill")
        T(f, k, "label", INK3, fontSize=11); T(f, v, "body-b", MUTED if i == 0 else INK)
    button(sb, "Search trips", "primary", "lg", arrow=True, fill_w=True)
    st = H(pg, "Stats", pad=[40, 20, 8, 20], mainAlign="spaceBetween", sh="fill")
    for v, k in [("42 yrs", "experience"), ("1.2M+", "travellers"), ("4.9★", "rating")]:
        stat(st, v, k, size="h4")
    d = V(pg, "Destinations", gap=24, pad=[64, 20, 64, 20], sh="fill")
    kicker(d, "01", "Destinations")
    headline(d, "Where will you", "wander next?", "h3")
    r = H(d, "Chips", gap=8)
    for i, o in enumerate(["All", "India", "International"]):
        chip(r, o, i == 0)
    sc = H(d, "Carousel", gap=16, sh="fill")
    dest_card(sc, "kashmir", "Kashmir", "Houseboats & meadows", "12 tours", "34.08° N", 280, 360)
    dest_card(sc, "kerala", "Kerala", "Backwaters & tea hills", "9 tours", "9.49° N", 280, 360)
    dots = H(d, "Dots", gap=6, mainAlign="center", sh="fill")
    for i in range(4):
        rect(dots, 20 if i == 0 else 6, 6, INK if i == 0 else LINE, "Dot", cornerRadius=3)
    t = V(pg, "Tours", gap=24, pad=[64, 20, 64, 20], fill=PAPER2, sh="fill")
    kicker(t, "02", "Handpicked")
    headline(t, "Tours travellers", "love most.", "h3")
    tour_card(t, TOURS[0], 350, 220)
    tour_card(t, TOURS[1], 350, 220)
    button(t, "View all 64 tours", "outline", "md", arrow=True, fill_w=True)
    wy = V(pg, "Why", gap=16, pad=[64, 20, 64, 20], fill=INK, sh="fill")
    kicker(wy, "03", "Why us", dark=True)
    headline(wy, "Four decades of", "the little things.", "h3", dark=True)
    for g, tt, dd in [("₹", "Honest, all-inclusive prices", "No add-ons at checkout."), ("✓", "A leader on every trip", "Day one to home."), ("☎", "24×7 real-person support", "Whatever the hour.")]:
        rr = H(wy, "Point", gap=16, pad=20, fill="#FFFFFF0A", stroke="#FFFFFF1F", strokeWeight=1, cornerRadius=R_MD, crossAlign="center", sh="fill")
        icon(rr, g, GOLD, INK, 44)
        tv = V(rr, "T", gap=2, sh="fill"); T(tv, tt, "body-b", ON_INK); T(tv, dd, "small", ON_INK2)
    f = V(pg, "Footer", gap=20, pad=[48, 20, 40, 20], fill="#08202C", sh="fill")
    T(f, "Wander well.", "h2", GOLD, fontStyle="Italic")
    logo(f, dark=True, size=0.82)
    T(f, "+91 98204 12345\nhello@hiddenmiles.in", "small", ON_INK2)
    T(f, "© 2026 Hidden Miles Holidays Pvt. Ltd.", "small", "#8FC6D6", fontSize=12)
    bar = H(pg, "Sticky action bar", gap=10, pad=[12, 16, 28, 16], fill=WHITE, sh="fill", stroke=LINE, strokeTopWeight=1, effects=[{"type": "dropShadow", "color": INK + "1F", "offset": [0, -8], "radius": 24}])
    icon(bar, "☎", PAPER3, INK, 52)
    icon(bar, "✆", "#1C9A6C", WHITE, 52)
    button(bar, "Plan my trip", "primary", "lg", arrow=True, fill_w=True)


def m_menu(x):
    pg = page("M2 Menu — Mobile", x, width=MW)
    pg_h = V(pg, "Drawer", gap=0, fill=PAPER, sh="fill")
    n = H(pg_h, "Header", pad=[14, 20, 14, 20], mainAlign="spaceBetween", crossAlign="center", sh="fill")
    logo(n, size=0.82)
    icon(n, "✕", INK, GOLD, 42)
    s = H(pg_h, "Search", gap=12, pad=[14, 18, 14, 18], fill=WHITE, cornerRadius=999, stroke=LINE, strokeWeight=1.5, crossAlign="center", sh="fill")
    wrap = V(pg_h, "Body", gap=8, pad=[16, 20, 24, 20], sh="fill")
    for i, (item, sub) in enumerate([("Group Tours", None), ("Destinations", ["Kashmir", "Kerala", "Rajasthan", "Europe", "Japan", "All destinations →"]), ("Speciality Tours", None), ("Personalised", None), ("About", None), ("Guest stories", None), ("Contact", None)]):
        r = V(wrap, "Item", gap=12, pad=[18, 0, 18, 0], sh="fill", stroke=LINE, strokeBottomWeight=1)
        hh = H(r, "Row", mainAlign="spaceBetween", crossAlign="center", sh="fill")
        T(hh, item, "h4", INK if sub else INK)
        T(hh, "−" if sub else "›", "title", GOLD_D if sub else INK3)
        if sub:
            cs = H(r, "Sub", gap=8, wrap=True, crossGap=8, sh="fill")
            for sname in sub:
                chip(cs, sname)
    cta = V(pg_h, "CTA", gap=12, pad=[8, 20, 32, 20], sh="fill")
    button(cta, "Plan my trip", "ink", "lg", arrow=True, fill_w=True)
    r = H(cta, "Contact", gap=12, sh="fill")
    button(r, "Call", "light", "md", icon="☎", fill_w=True); button(r, "WhatsApp", "whatsapp", "md", icon="✆", fill_w=True)
    T(cta, "Mon–Sat · 9:30 am – 7:00 pm", "small", INK3, textAlign="center", sizingH="fill")
    T(s, "⌕", "title", INK)
    T(s, "Search tours & destinations", "body", MUTED)


def m_tour(x):
    pg = page("M3 Tour Detail — Mobile", x, width=MW)
    g = frame(pg, "Gallery", None, w=MW, h=380, fill=INK, clip=True)
    image(g, "kashmir")
    rect(g, MW, 380, grad([(0, INK + "66"), (0.3, INK + "00")]), "Scrim")
    icon(g, "←", "#FFFFFFEB", INK, 42, x=16, y=16)
    icon(g, "♡", "#FFFFFFEB", INK, 42, x=MW - 16 - 42 - 50, y=16)
    icon(g, "↗", "#FFFFFFEB", INK, 42, x=MW - 16 - 42, y=16)
    badge(g, "1 / 24", "glass", x=MW - 80, y=330)
    c = V(pg, "Content", gap=24, pad=[28, 20, 32, 20], sh="fill")
    tg = H(c, "Badges", gap=8); badge(tg, "Bestseller"); badge(tg, "8D / 7N", "blue")
    T(c, "Magical Kashmir", "h2", fontSize=40, lineHeight=46)
    mr = H(c, "Meta", gap=10, crossAlign="center"); rating(mr, "4.9", "210"); T(mr, "·", "small", LINE); T(mr, "Srinagar → Sonmarg", "small", INK2)
    tabs = H(c, "Tabs", gap=8)
    for i, t in enumerate(["Overview", "Itinerary", "Reviews"]):
        chip(tabs, t, i == 1)
    for i, (t, d) in enumerate([("Arrive Srinagar · Dal Lake", "Houseboat check-in and a sunset shikara ride."), ("Old city & gardens", None), ("Gulmarg · Meadow of flowers", None), ("Pahalgam via saffron fields", None)]):
        card = V(c, "Day", gap=10, pad=20, fill=WHITE, cornerRadius=R_MD, stroke=LINE, strokeWeight=1, sh="fill")
        hh = H(card, "Head", gap=14, crossAlign="center", sh="fill")
        icon(hh, f"{i + 1:02d}", INK if d else PAPER3, GOLD if d else INK, 40)
        tv = V(hh, "T", gap=0, sh="fill"); T(tv, f"Day {i + 1}", "label", GOLD_D, fontSize=11); T(tv, t, "body-b")
        T(hh, "−" if d else "+", "title", INK3)
        if d:
            T(card, d, "small", INK2, sizingH="fill")
    bar = H(pg, "Sticky booking bar", gap=12, pad=[14, 20, 28, 20], mainAlign="spaceBetween", crossAlign="center", fill=WHITE, sh="fill", stroke=LINE, strokeTopWeight=1,
            effects=[{"type": "dropShadow", "color": INK + "1F", "offset": [0, -8], "radius": 24}])
    p = V(bar, "Price", gap=0)
    T(p, "From", "small", INK3, fontSize=12); T(p, "₹58,900", "price"); T(p, "12 Dec · 6 seats left", "small-b", DANGER, fontSize=12)
    button(bar, "Reserve", "primary", "lg", arrow=True)


# ------------------------------------------------------------------ design system sheet
def p_system(x, y):
    pg = frame(1, "00 Design System", "v", gap=72, pad=[96, 96, 96, 96], fill=WHITE, w=1440, sh="fixed", x=x, y=y)
    hl = V(pg, "Title", gap=12)
    kicker(hl, None, "Hidden Miles · Field Journal")
    headline(hl, "Design system", "v2.0", "h1")
    T(hl, "Tokens and components every page is built from. Use these values in code (globals.css @theme) — nothing off-scale.", "lead", INK2, w=760)

    def block(title):
        b = V(pg, title, gap=28, sh="fill")
        T(b, title, "h3")
        dashed(b, LINE, length=1248)
        return b
    b = block("Colour")
    r = H(b, "Swatches", gap=16, sh="fill", wrap=True, crossGap=16)
    for nm, hexv, use in [("Ink · navy-950", INK, "Text, dark sections"), ("Navy-700", INK2, "Secondary text"), ("Navy-500", INK3, "Meta, labels"), ("Paper · sand-50", PAPER, "Page background"),
                          ("Sand-100", PAPER2, "Alt sections"), ("Sand-200", PAPER3, "Chips, icon wells"), ("Sand-300", LINE, "Borders, route lines"), ("Gold-400", GOLD, "Primary action, accent"),
                          ("Gold-600", GOLD_D, "Accent text on paper"), ("Blue-500", BLUE, "Info"), ("Blue-700", BLUE_D, "Links"), ("Success", SUCCESS, "Availability")]:
        c = V(r, "Swatch", gap=12, w=190, sh="fixed")
        rect(c, 190, 110, hexv, "Chip", cornerRadius=16, stroke=LINE, strokeWeight=1)
        T(c, nm, "small-b"); T(c, f"{hexv} · {use}", "small", INK3, fontSize=12)
    b = block("Typography")
    for role, sample in [("display", "Journeys that stay"), ("h1", "Every departure, in one place"), ("h2", "Where will you wander next?"), ("h3", "Day by day"),
                         ("h4", "Magical Kashmir"), ("title", "Honest, all-inclusive prices"), ("lead", "Thoughtfully planned trips across India and the world."),
                         ("body", "Float across Dal Lake at sunrise and ride the Gulmarg gondola."), ("small", "Srinagar · Gulmarg · Pahalgam"), ("label", "Handpicked departures")]:
        rr = H(b, "Type row", gap=40, crossAlign="center", sh="fill")
        fam, st, sz, lh, tr = TYPE[role]
        T(rr, f"{role}\n{fam} {st} · {sz}/{lh}", "small", INK3, w=220, fontSize=13)
        T(rr, sample, role)
    T(b, "Accent: the second line of every display headline is Fraunces Italic in gold-600 (gold-400 on ink).", "small", INK2)
    b = block("Spacing & layout")
    r = H(b, "Scale", gap=24, crossAlign="max")
    for s_ in (4, 8, 12, 16, 24, 32, 48, 56, 64, 96, 128):
        c = V(r, "Step", gap=8, crossAlign="center")
        rect(c, s_, s_, GOLD, "Box", cornerRadius=2); T(c, str(s_), "small-b", INK, fontSize=12)
    T(b, "Frame 1440 · content column 1200 (side margins 120) · section padding 128 (major) / 96 (minor) · header→content 56 · card grid gap 32 · radii 12 / 20 / 28 / pill.", "body", INK2)
    b = block("Components")
    r = H(b, "Buttons", gap=16, crossAlign="center", wrap=True, crossGap=16, sh="fill")
    button(r, "Plan my trip", "ink", "md", arrow=True); button(r, "Reserve my seats", "primary", "md", arrow=True); button(r, "Talk to an expert", "outline", "md")
    button(r, "Save", "light", "sm", icon="♡"); button(r, "WhatsApp", "whatsapp", "md", icon="✆")
    r = H(b, "Chips & badges", gap=12, crossAlign="center", wrap=True, crossGap=12, sh="fill")
    chip(r, "All", True, count=60); chip(r, "India", count=24); chip(r, "Women's Special")
    for k in ("gold", "blue", "success", "danger", "ink"):
        badge(r, {"gold": "Bestseller", "blue": "Group tour", "success": "Verified", "danger": "Filling fast", "ink": "New"}[k], k)
    r = H(b, "Cards", gap=32, sh="fill", crossAlign="min")
    tour_card(r, TOURS[0], 376)
    dest_card(r, "kerala", "Kerala", "Backwaters & tea hills", "9 tours", "9.49° N  76.33° E", 376, 480)
    cc = V(r, "Bits", gap=24, sh="fill")
    field(cc, "Where would you like to go?", "Kerala, Bali, Japan…", placeholder=True, hint="Helper text sits below, 13px.")
    feature_tile(cc, "✓", "A leader on every trip", "500+ trained leaders travel with you, day one to home.")
    st = frame(cc, "Stamp holder", None, w=160, h=160)
    stamp(st, 0, 0, 148)


def build():
    jobs = []
    desktop = [p_home, p_tours, p_tour_detail, p_destinations, p_destination_detail, p_speciality, p_experiences,
               p_personalised, p_corporate, p_about, p_contact, p_testimonials, p_404,
               p_book_trip, p_book_lead, p_book_addons, p_book_payment, p_book_confirmed]
    for i, fn in enumerate(desktop):
        cmds.clear(); fn(1600 * i); jobs.append((fn.__name__, list(cmds)))
    for i, fn in enumerate([m_home, m_menu, m_tour, m_trip, m_payment]):
        cmds.clear(); fn(-2640 + 520 * i); jobs.append((fn.__name__, list(cmds)))
    cmds.clear(); p_system(-4240, 0); jobs.append(("p_system", list(cmds)))
    cmds.clear(); mega_menu(1, 120, -760); jobs.append(("mega_menu", list(cmds)))
    return jobs


if __name__ == "__main__":
    work = os.path.join(os.path.dirname(os.path.abspath(OUT)), ".gen")
    os.makedirs(work, exist_ok=True)
    first = True
    for name, cs in build():
        path = os.path.join(work, name + ".json")
        json.dump([{"command": "command.batch", "params": {"commands": cs, "label": name}}], open(path, "w"), ensure_ascii=False)
        args = ["figcraft-cli", "run", "--out", OUT, path] if first else ["figcraft-cli", "run", "--in", OUT, "--out", OUT, path]
        res = subprocess.run(args, capture_output=True, text=True)
        ok = '"ok":true' in res.stdout
        print(f"{name:24s} {len(cs):4d} cmds  {'ok' if ok else 'FAILED'}")
        if not ok:
            print(res.stdout[-1500:], res.stderr[-1500:])
            sys.exit(1)
        first = False

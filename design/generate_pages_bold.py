"""Hidden Miles — "Bold Postcard" variant (inspired by the TreClean Framer template).

Re-skins every page from generate_pages.py and redraws the signature sections:
  * saturated ocean-blue blocks with a faint travel-doodle pattern, cream sections, bright gold accent
  * Anton display headlines (tall, condensed) + Sora body text
  * floating cream capsule navigation, marquee word strip with sparkles
  * photos with one oversized corner radius, big gold step numbers, scalloped card edges

    python3 design/generate_pages_bold.py <image-dir> <out.figcraft>
Needs the Anton and Sora fonts installed (Google Fonts, OFL).
"""
import os
import random
import sys

sys.argv += [] if len(sys.argv) > 2 else ["img", "out.figcraft"]
import generate_pages as gp  # noqa: E402  (reads argv for IMG_DIR / OUT)
from generate_pages import H, V, T, frame, node, rect, image, photo, setp, ref  # noqa: E402

# ------------------------------------------------------------------ re-theme tokens
BRAND = "#1C7FA4"          # blue-600: the saturated block colour
BRAND_D = "#196785"        # blue-700
CREAM = "#FDF8E6"          # warm cream sections / capsule
SUN = "#E9C94F"            # gold-300: bright accent (numbers, badges)
gp.PAPER, gp.PAPER2, gp.PAPER3, gp.LINE = "#FFFFFF", CREAM, "#F6EED8", "#EADFC0"
gp.GOLD, gp.GOLD_D, gp.GOLD_L = SUN, "#A87612", "#FBF1C8"
gp.INK2, gp.INK3 = "#2F3E4A", "#5B6670"
gp.MUTED = "#7A8590"
gp.R_LG, gp.R_MD, gp.R_SM = 24, 16, 12
gp.TYPE.update({
    "display": ("Anton", "Regular", 104, 106, 0),
    "h1": ("Anton", "Regular", 80, 84, 0),
    "h2": ("Anton", "Regular", 64, 70, 0),
    "h3": ("Anton", "Regular", 40, 46, 0),
    "h4": ("Anton", "Regular", 28, 34, 0.2),
    "title": ("Sora", "SemiBold", 18, 26, 0),
    "lead": ("Sora", "Regular", 18, 30, 0),
    "body": ("Sora", "Regular", 16, 26, 0),
    "body-b": ("Sora", "SemiBold", 16, 24, 0),
    "small": ("Sora", "Regular", 14, 22, 0),
    "small-b": ("Sora", "SemiBold", 14, 20, 0),
    "label": ("Sora", "Medium", 12, 16, 1.6),
    "button": ("Sora", "Bold", 15, 20, 1.2),
    "price": ("Sora", "Bold", 22, 28, 0),
})
INK, WHITE, SIDE, W, SEC = gp.INK, gp.WHITE, gp.SIDE, gp.W, gp.SEC
gp.BTN.update({"primary": (SUN, INK, None), "ink": (INK, CREAM, None), "outline": (None, INK, INK),
               "light": (CREAM, BRAND, None), "ghost-light": ("#FDF8E61A", CREAM, "#FDF8E659")})

# ------------------------------------------------------------------ overridden components
_button = gp.button


def button(parent, label, kind="primary", size="md", arrow=False, fill_w=False, icon=None):
    """Chunky rounded-rect buttons with uppercase tracked labels."""
    b = _button(parent, label.upper() if kind != "whatsapp" else label, kind, size, arrow, fill_w, icon)
    setp(b, cornerRadius=14)
    return b


gp.button = button


def kicker(parent, num, label, dark=False):
    k = H(parent, "Kicker", gap=10, crossAlign="center")
    T(k, "✦", "small-b", SUN if dark else BRAND, fontSize=14)
    T(k, label.upper(), "small", CREAM if dark else gp.INK3, fontSize=15, letterSpacing=1.2)
    return k


gp.kicker = kicker


def headline(parent, line1, accent=None, role="h2", dark=False, align="left", w=None):
    box = V(parent, "Headline", gap=0, crossAlign={"left": "min", "center": "center"}[align], sh="hug" if w else "fill")
    kw = {"w": w} if w else {"sizingH": "fill"}
    T(box, line1, role, WHITE if dark else INK, textAlign=align, **kw)
    if accent:
        T(box, accent, role, SUN if dark else BRAND, textAlign=align, **kw)
    return box


gp.headline = headline


def doodles(parent, w, h, seed=3, color=CREAM, alpha="14", n=46):
    """Faint scattered travel doodles — the patterned backdrop of brand blocks."""
    g = frame(parent, "Doodle pattern", None, w=w, h=h, clip=True)
    rnd = random.Random(seed)
    for _ in range(n):
        x, y = rnd.uniform(-20, w - 20), rnd.uniform(-20, h - 20)
        T(g, rnd.choice("✈⛰✦☼⚑✿⛵♨☂✧"), "small", color + alpha, fontSize=rnd.choice((28, 36, 44, 56)), rotation=rnd.uniform(-25, 25), x=x, y=y)
    return g


def utility_bar(pg):  # the capsule nav carries contact info; no separate utility bar
    return None


gp.utility_bar = utility_bar


def nav(pg, active, open_menu=False):
    band = V(pg, "Nav band", pad=[24, 60, 24, 60], fill=BRAND, sh="fill")
    cap = H(band, "Capsule nav", pad=8, gap=16, fill=CREAM, cornerRadius=22, mainAlign="spaceBetween", crossAlign="center", sh="fill",
            effects=gp.shadow(12, 32, "26"))
    left = H(cap, "Left", gap=16, crossAlign="center")
    m = H(left, "Menu", fill=BRAND, cornerRadius=14, w=56, h=56, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center")
    T(m, "☰", "title", CREAM, fontSize=20)
    lg = H(left, "Logo", gap=8, crossAlign="center")
    T(lg, "✦", "h4", BRAND, fontFamily="Sora", fontSize=26)
    T(lg, "Hidden Miles", "h4", BRAND, fontSize=30, lineHeight=34)
    links = H(cap, "Links", gap=4, crossAlign="center")
    for item, has_menu in gp.NAV:
        on = item == active
        l = H(links, "Nav item", gap=6, pad=[10, 14, 10, 14], cornerRadius=12, fill=BRAND if on else None, crossAlign="center")
        T(l, item + ("  ⌄" if has_menu else ""), "small-b", CREAM if on else INK, fontSize=14)
    r = H(cap, "Right", gap=10, crossAlign="center")
    s = H(r, "Search", fill=WHITE, cornerRadius=14, w=56, h=56, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", stroke=gp.LINE, strokeWeight=1)
    T(s, "⌕", "title", INK, fontSize=20)
    c = H(r, "Call", fill=SUN, cornerRadius=14, w=56, h=56, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", stroke=BRAND, strokeWeight=2)
    T(c, "☎", "title", INK, fontSize=20)
    return band


gp.nav = nav


def marquee(pg, words, bg=BRAND, fg=CREAM, star=SUN):
    m = H(pg, "Marquee", gap=28, pad=[14, 0, 14, 0], fill=bg, sh="fill", clip=True, crossAlign="center")
    for i, wd in enumerate(words * 2):
        if i:
            T(m, "✦", "h4", star, fontFamily="Sora", fontSize=26)
        T(m, wd.upper(), "h3", fg, fontSize=40, lineHeight=44)
    return m


def scallop(parent, w, color=SUN, name="Scallop edge"):
    """Wavy cloud edge — a row of overlapping circles, clipped to 26px."""
    g = frame(parent, name, None, w=w, h=26, clip=True, sh="fill")
    x = -10
    while x < w + 40:
        node("ellipse", g, "Bump", {"fill": color}, x=x, y=0, width=52, height=52)
        x += 40
    return g


def page_hero(pg, path, line1, accent, sub, img, extra=None, coords=None):
    """Brand-blue block continuing from the nav band: centred Anton title + big-corner photo."""
    h = frame(pg, "Page hero", None, fill=BRAND, w=W, h=640, clip=True)
    doodles(h, W, 640, seed=len(line1))
    c = V(h, "Copy", gap=22, w=620, sh="fixed", x=SIDE, y=56)
    gp.crumbs(c, path, dark=True)
    headline(c, line1, accent, "h1", dark=True, w=620)
    T(c, sub, "lead", "#FDF8E6CC", w=520)
    if extra:
        _stat = gp.stat
        gp.stat = lambda parent, v, k, dark=False, size="h2", sh="hug": _stat(parent, v, k, True, size, sh)
        extra(c)
        gp.stat = _stat
    p = photo(h, img, 520, 520, [24, 160, 24, 24], "Hero photo", x=W - SIDE - 520, y=40)
    if coords:
        b = H(p, "Tag", pad=[8, 14, 8, 14], fill=SUN, cornerRadius=10, x=24, y=460)
        T(b, coords, "label", INK, fontSize=11)
    return h


gp.page_hero = page_hero


def section_head(parent, num, label, line1, accent=None, sub=None, right=None, dark=False, align="left"):
    h = H(parent, "Section header", mainAlign="spaceBetween", crossAlign="max", sh="fill", gap=48)
    t = V(h, "Title", gap=18, sh="fill", crossAlign="center" if align == "center" else "min")
    kicker(t, num, label, dark)
    headline(t, line1, accent, "h2", dark, align)
    if sub:
        T(t, sub, "lead", "#FDF8E6CC" if dark else gp.INK2, w=620, textAlign=align)
    if right:
        right(h)
    return h


gp.section_head = section_head


def footer(pg):
    f = V(pg, "Footer", gap=64, pad=[96, SIDE, 40, SIDE], fill=INK, sh="fill", clip=True)
    top = H(f, "Sign-off", mainAlign="spaceBetween", crossAlign="max", sh="fill", gap=48)
    hl = V(top, "Headline", gap=0)
    T(hl, "Wander well,", "display", CREAM, fontSize=88, lineHeight=92)
    T(hl, "we'll handle the rest.", "display", SUN, fontSize=88, lineHeight=92)
    nl = V(top, "Newsletter", gap=16, w=400, sh="fixed")
    T(nl, "Postcards, once a month", "title", CREAM)
    T(nl, "New departures, early-bird fares and one good travel story.", "small", "#FDF8E6B3", sizingH="fill")
    row = H(nl, "Form", pad=6, gap=8, crossAlign="center", cornerRadius=16, fill="#FDF8E614", sh="fill")
    i = H(row, "Input", pad=[0, 14, 0, 14], sh="fill")
    T(i, "you@email.com", "small", "#FDF8E680")
    button(row, "Subscribe", "primary", "sm")
    cols = H(f, "Columns", gap=48, sh="fill", pad=[40, 0, 0, 0], stroke="#FDF8E626", strokeTopWeight=1)
    for h_, items in [("Travel", ["Group tours", "Destinations", "Speciality tours", "Personalised", "Corporate"]),
                      ("Company", ["About us", "Guest stories", "Experiences", "Careers", "Contact"]),
                      ("Help", ["Booking & payments", "Cancellations", "Visa assistance", "FAQs"]),
                      ("Visit us", ["302, Meridian House", "Andheri East, Mumbai", "Mon–Sat, 9:30–7:00", "+91 98204 12345"])]:
        c = V(cols, h_, gap=14, sh="fill")
        T(c, h_.upper(), "label", SUN)
        for it in items:
            T(c, it, "small", "#FDF8E6CC", sizingH="fill")
    bt = H(f, "Legal", mainAlign="spaceBetween", sh="fill", crossAlign="center")
    T(bt, "© 2026 Hidden Miles Holidays Pvt. Ltd.  ·  IATA accredited", "small", "#FDF8E680", fontSize=13)
    T(bt, "Privacy   ·   Terms   ·   Instagram   ·   YouTube", "small", "#FDF8E6CC", fontSize=13)


gp.footer = footer


def cta_band(pg, line1="Not sure where to go?", accent="Let's talk it through.", sub="Tell us how you like to travel — a specialist sends a personalised itinerary, free, within 24 hours.", img="paris"):
    w = frame(pg, "CTA", None, fill=BRAND, w=W, h=620, clip=True)
    doodles(w, W, 620, seed=11)
    c = V(w, "Copy", gap=24, w=900, sh="fixed", crossAlign="center", x=270, y=120)
    headline(c, line1, accent, "h1", dark=True, align="center", w=900)
    T(c, sub, "lead", "#FDF8E6CC", w=620, textAlign="center")
    b = H(c, "Buttons", gap=12)
    button(b, "Plan my trip", "light", "lg", arrow=True)
    button(b, "Call now", "primary", "lg", icon="☎")


gp.cta_band = cta_band


def feature_tile(parent, glyph, title, desc, dark=False, num=None):
    c = V(parent, "Feature", gap=14, pad=28, cornerRadius=20, sh="fill", fill="#FDF8E60F" if dark else CREAM, crossAlign="min")
    gp.icon(c, glyph, SUN if dark else BRAND, INK if dark else CREAM, 52, 14)
    T(c, title, "h4", CREAM if dark else INK, sizingH="fill")
    T(c, desc, "small", "#FDF8E6B3" if dark else gp.INK3, sizingH="fill")
    return c


gp.feature_tile = feature_tile


# ------------------------------------------------------------------ new home page
def p_home(x):
    pg = gp.page("01 Home — Desktop", x)
    nav(pg, "Home")
    hero = frame(pg, "Hero", None, fill=BRAND, w=W, h=1180, clip=True)
    doodles(hero, W, 1180, seed=7, n=70)
    c = V(hero, "Copy", gap=24, w=1100, sh="fixed", crossAlign="center", x=170, y=56)
    pr = H(c, "Proof", gap=14, crossAlign="center")
    av = H(pr, "Avatars", gap=-12)
    for col, ini in ((SUN, "A"), ("#F2DFA0", "R"), (CREAM, "M")):
        a = H(av, "Avatar", fill=col, cornerRadius=999, w=48, h=48, sh="fixed", sv="fixed", mainAlign="center", crossAlign="center", stroke=CREAM, strokeWeight=3)
        T(a, ini, "small-b", INK)
    pv = V(pr, "T", gap=2)
    rr = H(pv, "R", gap=8, crossAlign="center"); T(rr, "Rating", "small", CREAM); T(rr, "★", "small-b", SUN); T(rr, "4.9", "small-b", CREAM)
    T(pv, "12,400+ verified traveller reviews", "small", "#FDF8E6CC")
    hl = V(c, "Headline", gap=0, crossAlign="center")
    T(hl, "Group Tours Across", "display", WHITE, textAlign="center")
    T(hl, "India & The World", "display", SUN, textAlign="center")
    T(c, "Escorted small-group journeys with a tour leader from day one, honest all-inclusive prices and a real person on call — since 1984.", "lead", "#FDF8E6D9", w=620, textAlign="center")
    b = H(c, "Buttons", gap=12)
    button(b, "Explore tours", "light", "lg", arrow=True)
    button(b, "Talk to an expert", "ghost-light", "lg")
    # photo pair with oversized corners + feature tiles between
    row = H(hero, "Photos", gap=0, w=1200, sh="fixed", x=SIDE, y=600, mainAlign="spaceBetween")
    photo(row, "kashmir", 440, 480, [24, 200, 24, 24], "Photo A")
    mid = V(row, "Promises", gap=40, w=260, sh="fixed", crossAlign="center", pad=[40, 0, 0, 0])
    for g_, t_, d_ in (("₹", "All-Inclusive", "No surprise add-ons"), ("✓", "Leader On Board", "Day one to home"), ("☎", "24×7 Support", "A real person, always")):
        it = V(mid, "Promise", gap=8, crossAlign="center")
        gp.icon(it, g_, SUN, INK, 56, 16)
        T(it, t_, "h4", CREAM, textAlign="center")
        T(it, d_, "small", "#FDF8E6CC", textAlign="center")
    photo(row, "kerala", 440, 480, [200, 24, 24, 24], "Photo B")
    marquee(pg, ["Kashmir", "Kerala", "Ladakh", "Rajasthan", "Japan", "Bali", "Europe"], bg=INK)
    # tours as alternating editorial rows
    s = gp.section(pg, "Featured tours", CREAM, gap=72)
    section_head(s, None, "Handpicked departures", "Tours our travellers", "love the most.", align="center")
    for i, t in enumerate(gp.TOURS[:3]):
        img, title, route, dur, price, old, tag, score, cnt, nxt, crd = t
        r = H(s, "Tour row", gap=64, sh="fill", crossAlign="center")

        def pic(p):
            photo(p, img, 560, 380, [24, 120, 24, 24] if i % 2 == 0 else [120, 24, 24, 24], "Photo")

        def info(p):
            v = V(p, "Info", gap=18, sh="fill")
            gp.icon(v, "✈⛵⛩"[i], BRAND, CREAM, 64, 18)
            th = H(v, "Title", gap=14, crossAlign="center")
            T(th, title, "h3")
            if tag:
                gp.badge(th, tag, "gold")
            T(v, f"{dur}  ·  {route}  ·  ★ {score} ({cnt})", "small-b", gp.INK3)
            T(v, "Next departure " + nxt + ". Tour leader, stays, most meals and every transfer included.", "body", gp.INK2, sizingH="fill")
            pr_ = H(v, "Price", gap=14, crossAlign="center")
            T(pr_, "from " + price, "h3", INK, fontFamily="Sora", fontStyle="Bold", fontSize=34, lineHeight=40)
            gp.icon(pr_, "↗", BRAND, CREAM, 52)
        if i % 2 == 0:
            pic(r); info(r)
        else:
            info(r); pic(r)
    m = H(s, "More", mainAlign="center", sh="fill")
    button(m, "View all 64 tours", "ink", "md", arrow=True)
    # how it works — gold numbers, scalloped cards
    hw = frame(pg, "How it works", None, fill=BRAND, w=W, h=1040, clip=True)
    doodles(hw, W, 1040, seed=21)
    hd = V(hw, "Head", gap=18, w=560, sh="fixed", x=SIDE, y=96)
    kicker(hd, None, "How it works", dark=True)
    headline(hd, "Three steps from", "dream to departure.", "h2", dark=True)
    T(hd, "Small groups, fixed dates, one simple booking. Change your date free up to 30 days before.", "lead", "#FDF8E6CC", w=480)
    steps = [("01", "2 minutes", "Pick a departure", "Choose a date and your city. Seats and prices update live.", "group"),
             ("02", "25% to reserve", "Lock your seats", "Pay a quarter now, the rest 30 days before you fly.", "kerala"),
             ("03", "Day one", "Meet your leader", "Your tour leader greets the group at the airport.", "kashmir")]
    for i, (n, tagt, t_, d_, img_) in enumerate(steps):
        x0, y0 = SIDE + i * 412, 440 - i * 70
        top = H(hw, "Number", gap=14, crossAlign="center", x=x0, y=y0)
        T(top, n, "display", SUN, fontSize=88, lineHeight=88)
        tg = H(top, "Tag", pad=[6, 12, 6, 12], fill=INK, cornerRadius=999); T(tg, tagt.upper(), "label", CREAM, fontSize=11)
        card = V(hw, "Step card", gap=0, fill=CREAM, cornerRadius=24, w=376, sh="fixed", clip=True, x=x0, y=y0 + 104)
        tv = V(card, "Text", gap=12, pad=[28, 28, 20, 28], sh="fill")
        T(tv, t_, "h3", INK, sizingH="fill")
        T(tv, d_, "body", gp.INK2, sizingH="fill")
        scallop(card, 376)
        p = frame(card, "Photo", None, w=376, h=220, fill=SUN, sh="fill"); image(p, img_)
    # stats
    st = H(pg, "Stats", gap=0, pad=[96, SIDE, 96, SIDE], sh="fill", fill=CREAM)
    for v, k in (("42yr", "crafting holidays"), ("1.2M+", "travellers hosted"), ("4.9★", "Google rating"), ("96%", "travel with us again")):
        c_ = V(st, "Stat", gap=6, sh="fill", crossAlign="center")
        T(c_, v, "h1", BRAND, textAlign="center")
        T(c_, k, "small", gp.INK3, textAlign="center")
    # destinations bento (cream cards)
    ds = gp.section(pg, "Destinations", WHITE)
    section_head(ds, None, "Destinations", "Where will you", "wander next?",
                 right=lambda h: button(h, "All 60 destinations", "outline", "md", arrow=True))
    r = H(ds, "Cards", gap=24, sh="fill")
    for k_, n_, sub_, cnt_, crd_ in gp.INDIA[:3]:
        gp.dest_card(r, k_, n_, sub_, cnt_, crd_, 384, 460)
    # reviews
    rv = gp.section(pg, "Reviews", CREAM)
    section_head(rv, None, "Guest stories", "Travellers don't do", "polite reviews.", align="center")
    rr = H(rv, "Cards", gap=24, sh="fill")
    for nm, trip, q in (("Ananya D.", "Kashmir · Oct 2026", "Flawless from the houseboat to Pahalgam. Our leader felt like family by day two."),
                        ("Vikram M.", "Europe · May 2026", "Fourteen days, six countries, zero stress. Every shortcut — and every gelato shop."),
                        ("Farida Q.", "Women's Special · Japan", "Travelled solo, came back with twenty friends. Safe and looked after throughout.")):
        cc = V(rr, "Review", gap=18, pad=32, fill=WHITE, cornerRadius=24, sh="fill")
        T(cc, "★★★★★", "small-b", SUN, fontSize=18)
        T(cc, "“" + q + "”", "lead", INK, sizingH="fill")
        a = H(cc, "Author", gap=12, crossAlign="center")
        gp.icon(a, nm[0], BRAND, CREAM, 44)
        tv = V(a, "T", gap=0); T(tv, nm, "body-b"); T(tv, trip, "small", gp.INK3, fontSize=13)
    cta_band(pg, "Come home with", "stories, not stress.")
    footer(pg)


gp.p_home = p_home


if __name__ == "__main__":
    import subprocess, json  # noqa: E401
    work = os.path.join(os.path.dirname(os.path.abspath(gp.OUT)), ".gen-bold")
    os.makedirs(work, exist_ok=True)
    first = True
    for name, cs in gp.build():
        path = os.path.join(work, name + ".json")
        json.dump([{"command": "command.batch", "params": {"commands": cs, "label": name}}], open(path, "w"), ensure_ascii=False)
        args = ["figcraft-cli", "run", "--out", gp.OUT, path] if first else ["figcraft-cli", "run", "--in", gp.OUT, "--out", gp.OUT, path]
        res = subprocess.run(args, capture_output=True, text=True)
        ok = '"ok":true' in res.stdout
        print(f"{name:24s} {len(cs):4d} cmds  {'ok' if ok else 'FAILED'}")
        if not ok:
            print(res.stdout[-1500:], res.stderr[-1500:])
            sys.exit(1)
        first = False
